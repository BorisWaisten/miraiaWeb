<?php
defined('MIRAIA_API_BOOT') or die('Acceso directo no permitido.');

require_once __DIR__ . '/Database.php';

/**
 * Acceso a datos de `proyectos` — sección "Proyectos realizados" del home.
 * Tres campos de texto arman la card (ver Projects.tsx):
 *   etiqueta → tipo de espacio + ubicación (ej. "Oficinas corporativas · Palermo, CABA")
 *   nombre   → producto instalado + superficie (ej. "Alfombra modular Vienna — 850 m²")
 *   cliente  → quién encargó el proyecto, opcional (ej. "Arq. Estudio Bavera") — migración 013
 * La imagen (migración 013 no la toca) es una URL de Cloudinary pegada a mano
 * en el admin, igual que `nosotros_secciones.imagen_url` — no hay carpeta ni
 * convención de Cloudinary propia para proyectos todavía.
 */
final class Proyectos
{
    public static function mapRow(array $fila): array
    {
        return [
            'id' => (int) $fila['id'],
            'slug' => $fila['slug'],
            'nombre' => $fila['nombre'],
            'etiqueta' => $fila['etiqueta'],
            'cliente' => $fila['cliente'],
            'imagen' => $fila['imagen'],
            'esPrincipal' => (bool) $fila['destacado_principal'],
            'activo' => (bool) $fila['activo'],
            'orden' => (int) $fila['orden'],
            'createdAt' => $fila['created_at'],
            'updatedAt' => $fila['updated_at'],
        ];
    }

    public static function listarActivos(int $limite = 3): array
    {
        $stmt = Database::get()->prepare(
            'SELECT * FROM proyectos WHERE activo = 1 ORDER BY orden ASC LIMIT ?'
        );
        $stmt->bindValue(1, $limite, PDO::PARAM_INT);
        $stmt->execute();
        return array_map(self::mapRow(...), $stmt->fetchAll());
    }

    public static function listar(bool $soloActivos): array
    {
        $where = $soloActivos ? 'WHERE activo = 1' : '';
        $sql   = "SELECT * FROM proyectos {$where} ORDER BY orden ASC, created_at DESC";
        return array_map(self::mapRow(...), Database::get()->query($sql)->fetchAll());
    }

    public static function obtenerPorId(int $id): ?array
    {
        $stmt = Database::get()->prepare('SELECT * FROM proyectos WHERE id = ? LIMIT 1');
        $stmt->execute([$id]);
        $fila = $stmt->fetch();
        return $fila ? self::mapRow($fila) : null;
    }

    // ── Slug ─────────────────────────────────────────────────────────────────
    // El slug no tiene URL pública propia (no hay /proyectos/<slug>/): existe
    // solo para identificar cada fila de forma legible en la DB, igual que se
    // generaba antes de este CRUD. Se deriva de `nombre` y nunca lo edita el admin.

    private static function slugify(string $texto): string
    {
        $texto = strtolower($texto);
        $texto = iconv('UTF-8', 'ASCII//TRANSLIT', $texto) ?: $texto;
        $texto = preg_replace('/[^a-z0-9]+/', '-', $texto);
        return trim($texto, '-');
    }

    private static function generarSlugUnico(string $nombre, int $idAExcluir = 0): string
    {
        $base      = self::slugify($nombre) ?: 'proyecto';
        $candidato = $base;
        $sufijo    = 1;
        $db        = Database::get();
        while (true) {
            $stmt = $db->prepare('SELECT id FROM proyectos WHERE slug = ? AND id != ? LIMIT 1');
            $stmt->execute([$candidato, $idAExcluir]);
            if (!$stmt->fetch()) {
                return $candidato;
            }
            $sufijo++;
            $candidato = "{$base}-{$sufijo}";
        }
    }

    // ── CRUD ─────────────────────────────────────────────────────────────────

    /**
     * @param array $datos nombre, etiqueta, cliente?, imagen?, esPrincipal?, activo?, orden?
     */
    public static function crear(array $datos): array
    {
        $db   = Database::get();
        $slug = self::generarSlugUnico($datos['nombre']);

        if (!empty($datos['esPrincipal'])) {
            self::desmarcarPrincipales();
        }

        $stmt = $db->prepare(
            'INSERT INTO proyectos (slug, nombre, etiqueta, cliente, imagen, destacado_principal, activo, orden)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            $slug,
            $datos['nombre'],
            $datos['etiqueta'],
            $datos['cliente'] ?? null,
            $datos['imagen'] ?? null,
            !empty($datos['esPrincipal']) ? 1 : 0,
            isset($datos['activo']) ? (int) (bool) $datos['activo'] : 1,
            (int) ($datos['orden'] ?? 0),
        ]);

        return self::obtenerPorId((int) $db->lastInsertId());
    }

    public static function actualizar(int $id, array $datos): ?array
    {
        $actual = self::obtenerPorId($id);
        if (!$actual) {
            return null;
        }

        $nombre = $datos['nombre'] ?? $actual['nombre'];
        $slug   = ($nombre !== $actual['nombre']) ? self::generarSlugUnico($nombre, $id) : $actual['slug'];

        $esPrincipal = isset($datos['esPrincipal']) ? (bool) $datos['esPrincipal'] : $actual['esPrincipal'];
        if ($esPrincipal && !$actual['esPrincipal']) {
            self::desmarcarPrincipales();
        }

        $stmt = Database::get()->prepare(
            'UPDATE proyectos SET
                slug = ?, nombre = ?, etiqueta = ?, cliente = ?, imagen = ?,
                destacado_principal = ?, activo = ?, orden = ?
             WHERE id = ?'
        );
        $stmt->execute([
            $slug,
            $nombre,
            $datos['etiqueta'] ?? $actual['etiqueta'],
            array_key_exists('cliente', $datos) ? $datos['cliente'] : $actual['cliente'],
            array_key_exists('imagen', $datos) ? $datos['imagen'] : $actual['imagen'],
            $esPrincipal ? 1 : 0,
            isset($datos['activo']) ? (int) (bool) $datos['activo'] : (int) $actual['activo'],
            (int) ($datos['orden'] ?? $actual['orden']),
            $id,
        ]);

        return self::obtenerPorId($id);
    }

    public static function eliminar(int $id): ?array
    {
        $actual = self::obtenerPorId($id);
        if (!$actual) {
            return null;
        }
        $stmt = Database::get()->prepare('DELETE FROM proyectos WHERE id = ?');
        $stmt->execute([$id]);
        return $actual;
    }

    /**
     * Solo un proyecto puede ser la card grande del home (layout 2:1 en
     * Projects.tsx toma el primero con esPrincipal=true) — al marcar uno
     * nuevo, se desmarcan todos los demás.
     */
    private static function desmarcarPrincipales(): void
    {
        Database::get()->exec('UPDATE proyectos SET destacado_principal = 0 WHERE destacado_principal = 1');
    }
}
