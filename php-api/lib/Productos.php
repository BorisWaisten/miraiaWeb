<?php
defined('MIRAIA_API_BOOT') or die('Acceso directo no permitido.');

require_once __DIR__ . '/Database.php';

/**
 * Capa de acceso a datos para `productos`. Equivalente PHP de
 * src/lib/productos.repository.ts del prototipo Next/Node original.
 * Todas las queries son parametrizadas (PDO prepared statements).
 */
final class Productos
{
    public const CATEGORIAS_VALIDAS = ['piso_tecnico', 'alfombra_modular', 'vinilico_lvt'];

    /** Convierte una fila cruda de MySQL (snake_case) a la forma que consume el frontend (camelCase). */
    public static function mapRow(array $fila): array
    {
        return [
            'id' => (int) $fila['id'],
            'slug' => $fila['slug'],
            'nombre' => $fila['nombre'],
            'categoria' => $fila['categoria'],
            'descripcionCorta' => $fila['descripcion_corta'],
            'descripcionLarga' => $fila['descripcion_larga'],
            'especificaciones' => $fila['especificaciones'] ? json_decode($fila['especificaciones'], true) : null,
            'imagenPrincipal' => $fila['imagen_principal'],
            'destacado' => (bool) $fila['destacado'],
            'activo' => (bool) $fila['activo'],
            'orden' => (int) $fila['orden'],
            'createdAt' => $fila['created_at'],
            'updatedAt' => $fila['updated_at'],
        ];
    }

    public static function listar(bool $soloActivos): array
    {
        $db = Database::get();
        $sql = 'SELECT * FROM productos' . ($soloActivos ? ' WHERE activo = 1' : '') . ' ORDER BY orden ASC, created_at DESC';
        $filas = $db->query($sql)->fetchAll();
        return array_map(self::mapRow(...), $filas);
    }

    public static function obtenerPorSlug(string $slug): ?array
    {
        $stmt = Database::get()->prepare('SELECT * FROM productos WHERE slug = ? LIMIT 1');
        $stmt->execute([$slug]);
        $fila = $stmt->fetch();
        return $fila ? self::mapRow($fila) : null;
    }

    public static function obtenerPorId(int $id): ?array
    {
        $stmt = Database::get()->prepare('SELECT * FROM productos WHERE id = ? LIMIT 1');
        $stmt->execute([$id]);
        $fila = $stmt->fetch();
        return $fila ? self::mapRow($fila) : null;
    }

    private static function slugify(string $texto): string
    {
        $texto = strtolower($texto);
        $texto = iconv('UTF-8', 'ASCII//TRANSLIT', $texto) ?: $texto; // saca acentos (á→a, ñ→n, etc.)
        $texto = preg_replace('/[^a-z0-9]+/', '-', $texto);
        return trim($texto, '-');
    }

    private static function generarSlugUnico(string $nombre, int $idAExcluir = 0): string
    {
        $base = self::slugify($nombre);
        $candidato = $base;
        $sufijo = 1;
        $db = Database::get();

        while (true) {
            $stmt = $db->prepare('SELECT id FROM productos WHERE slug = ? AND id != ? LIMIT 1');
            $stmt->execute([$candidato, $idAExcluir]);
            if (!$stmt->fetch()) {
                return $candidato;
            }
            $sufijo++;
            $candidato = "{$base}-{$sufijo}";
        }
    }

    /** @param array $datos nombre, categoria, descripcionCorta, descripcionLarga?, especificaciones?, destacado?, activo?, orden? */
    public static function crear(array $datos, ?string $imagenPrincipal): array
    {
        $db = Database::get();
        $slug = self::generarSlugUnico($datos['nombre']);

        $stmt = $db->prepare(
            'INSERT INTO productos
                (slug, nombre, categoria, descripcion_corta, descripcion_larga, especificaciones,
                 imagen_principal, destacado, activo, orden)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            $slug,
            $datos['nombre'],
            $datos['categoria'],
            $datos['descripcionCorta'],
            $datos['descripcionLarga'] ?? null,
            isset($datos['especificaciones']) ? json_encode($datos['especificaciones']) : null,
            $imagenPrincipal,
            !empty($datos['destacado']) ? 1 : 0,
            isset($datos['activo']) ? (int) (bool) $datos['activo'] : 1,
            (int) ($datos['orden'] ?? 0),
        ]);

        return self::obtenerPorId((int) $db->lastInsertId());
    }

    public static function actualizar(int $id, array $datos, ?string $nuevaImagen): ?array
    {
        $actual = self::obtenerPorId($id);
        if (!$actual) {
            return null;
        }

        $nombre = $datos['nombre'] ?? $actual['nombre'];
        $slug = ($nombre !== $actual['nombre']) ? self::generarSlugUnico($nombre, $id) : $actual['slug'];

        $stmt = Database::get()->prepare(
            'UPDATE productos SET
                slug = ?, nombre = ?, categoria = ?, descripcion_corta = ?, descripcion_larga = ?,
                especificaciones = ?, imagen_principal = COALESCE(?, imagen_principal),
                destacado = ?, activo = ?, orden = ?
             WHERE id = ?'
        );
        $stmt->execute([
            $slug,
            $nombre,
            $datos['categoria'] ?? $actual['categoria'],
            $datos['descripcionCorta'] ?? $actual['descripcionCorta'],
            $datos['descripcionLarga'] ?? $actual['descripcionLarga'],
            isset($datos['especificaciones']) ? json_encode($datos['especificaciones']) : ($actual['especificaciones'] ? json_encode($actual['especificaciones']) : null),
            $nuevaImagen,
            isset($datos['destacado']) ? (int) (bool) $datos['destacado'] : (int) $actual['destacado'],
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
        $stmt = Database::get()->prepare('DELETE FROM productos WHERE id = ?');
        $stmt->execute([$id]);
        return $actual;
    }
}
