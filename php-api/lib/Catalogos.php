<?php
defined('MIRAIA_API_BOOT') or die('Acceso directo no permitido.');

require_once __DIR__ . '/Database.php';

/**
 * Capa de acceso a datos para `catalogos`.
 * Reemplaza el ENUM fijo `categoria` con una tabla dinámica gestionada desde el admin.
 */
final class Catalogos
{
    /** Convierte fila MySQL (snake_case) → array camelCase para el frontend. */
    public static function mapRow(array $fila): array
    {
        return [
            'id'             => (int) $fila['id'],
            'slug'           => $fila['slug'],
            'nombre'         => $fila['nombre'],
            'descripcion'    => $fila['descripcion'],
            'activo'         => (bool) $fila['activo'],
            'orden'          => (int) $fila['orden'],
            'totalProductos' => isset($fila['total_productos']) ? (int) $fila['total_productos'] : 0,
            'createdAt'      => $fila['created_at'],
            'updatedAt'      => $fila['updated_at'],
        ];
    }

    /** Lista todos los catálogos con conteo de productos asociados. */
    public static function listar(bool $soloActivos = false): array
    {
        $where = $soloActivos ? 'WHERE c.activo = 1' : '';
        $sql   = "SELECT c.*, COUNT(p.id) AS total_productos
                  FROM catalogos c
                  LEFT JOIN productos p ON p.catalogo_id = c.id
                  {$where}
                  GROUP BY c.id
                  ORDER BY c.orden ASC, c.nombre ASC";
        return array_map(self::mapRow(...), Database::get()->query($sql)->fetchAll());
    }

    public static function obtenerPorId(int $id): ?array
    {
        $stmt = Database::get()->prepare(
            'SELECT c.*, COUNT(p.id) AS total_productos
             FROM catalogos c
             LEFT JOIN productos p ON p.catalogo_id = c.id
             WHERE c.id = ?
             GROUP BY c.id
             LIMIT 1'
        );
        $stmt->execute([$id]);
        $fila = $stmt->fetch();
        return $fila ? self::mapRow($fila) : null;
    }

    // ── Slugify ───────────────────────────────────────────────────────────────

    private static function slugify(string $texto): string
    {
        $texto = strtolower(trim($texto));
        $texto = iconv('UTF-8', 'ASCII//TRANSLIT', $texto) ?: $texto;
        $texto = preg_replace('/[^a-z0-9]+/', '_', $texto);
        return trim($texto, '_');
    }

    private static function slugUnico(string $nombre, int $excluirId = 0): string
    {
        $base      = self::slugify($nombre);
        $candidato = $base;
        $sufijo    = 1;
        $db        = Database::get();
        while (true) {
            $stmt = $db->prepare('SELECT id FROM catalogos WHERE slug = ? AND id != ? LIMIT 1');
            $stmt->execute([$candidato, $excluirId]);
            if (!$stmt->fetch()) {
                return $candidato;
            }
            $sufijo++;
            $candidato = "{$base}_{$sufijo}";
        }
    }

    // ── CRUD ──────────────────────────────────────────────────────────────────

    public static function crear(array $datos): array
    {
        $db   = Database::get();
        $slug = (isset($datos['slug']) && $datos['slug'] !== '')
            ? $datos['slug']
            : self::slugUnico($datos['nombre']);

        $stmt = $db->prepare(
            'INSERT INTO catalogos (slug, nombre, descripcion, activo, orden)
             VALUES (?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            $slug,
            $datos['nombre'],
            $datos['descripcion'] ?? null,
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
        $slug   = (isset($datos['slug']) && $datos['slug'] !== '')
            ? $datos['slug']
            : ($nombre !== $actual['nombre'] ? self::slugUnico($nombre, $id) : $actual['slug']);

        $stmt = Database::get()->prepare(
            'UPDATE catalogos
             SET slug = ?, nombre = ?, descripcion = ?, activo = ?, orden = ?
             WHERE id = ?'
        );
        $stmt->execute([
            $slug,
            $nombre,
            array_key_exists('descripcion', $datos) ? $datos['descripcion'] : $actual['descripcion'],
            isset($datos['activo']) ? (int) (bool) $datos['activo'] : (int) $actual['activo'],
            (int) ($datos['orden'] ?? $actual['orden']),
            $id,
        ]);
        return self::obtenerPorId($id);
    }

    /**
     * Elimina el catálogo solo si no tiene productos asociados.
     * Devuelve el catálogo eliminado, o ['error_productos' => N] si hay productos.
     */
    public static function eliminar(int $id): ?array
    {
        $actual = self::obtenerPorId($id);
        if (!$actual) {
            return null;
        }
        if ($actual['totalProductos'] > 0) {
            return ['error_productos' => $actual['totalProductos']];
        }
        $stmt = Database::get()->prepare('DELETE FROM catalogos WHERE id = ?');
        $stmt->execute([$id]);
        return $actual;
    }
}
