<?php
defined('MIRAIA_API_BOOT') or die('Acceso directo no permitido.');

require_once __DIR__ . '/Database.php';

/**
 * Capa de acceso a datos para `categorias` (migración 007).
 * Una categoría agrupa productos y define, junto con el slug de cada
 * variante, la carpeta de Cloudinary donde viven sus imágenes:
 * miraia/productos/{categoria.slug}/{variante.slug}/{numero}
 */
final class Categorias
{
    public static function mapRow(array $fila): array
    {
        return [
            'id'        => (int) $fila['id'],
            'nombre'    => $fila['nombre'],
            'slug'      => $fila['slug'],
            'createdAt' => $fila['created_at'],
            'updatedAt' => $fila['updated_at'],
        ];
    }

    public static function listar(): array
    {
        $sql = 'SELECT * FROM categorias ORDER BY nombre ASC';
        return array_map(self::mapRow(...), Database::get()->query($sql)->fetchAll());
    }

    public static function obtenerPorId(int $id): ?array
    {
        $stmt = Database::get()->prepare('SELECT * FROM categorias WHERE id = ? LIMIT 1');
        $stmt->execute([$id]);
        $fila = $stmt->fetch();
        return $fila ? self::mapRow($fila) : null;
    }

    // ── Slug ─────────────────────────────────────────────────────────────────

    private static function slugify(string $texto): string
    {
        $texto = strtolower($texto);
        $texto = iconv('UTF-8', 'ASCII//TRANSLIT', $texto) ?: $texto;
        $texto = preg_replace('/[^a-z0-9]+/', '-', $texto);
        return trim($texto, '-');
    }

    private static function generarSlugUnico(string $nombre, int $idAExcluir = 0): string
    {
        $base      = self::slugify($nombre);
        $candidato = $base;
        $sufijo    = 1;
        $db        = Database::get();
        while (true) {
            $stmt = $db->prepare('SELECT id FROM categorias WHERE slug = ? AND id != ? LIMIT 1');
            $stmt->execute([$candidato, $idAExcluir]);
            if (!$stmt->fetch()) {
                return $candidato;
            }
            $sufijo++;
            $candidato = "{$base}-{$sufijo}";
        }
    }

    // ── CRUD ─────────────────────────────────────────────────────────────────

    public static function crear(string $nombre): array
    {
        $db   = Database::get();
        $slug = self::generarSlugUnico($nombre);

        $stmt = $db->prepare('INSERT INTO categorias (nombre, slug) VALUES (?, ?)');
        $stmt->execute([$nombre, $slug]);

        return self::obtenerPorId((int) $db->lastInsertId());
    }

    public static function actualizar(int $id, string $nombre): ?array
    {
        $actual = self::obtenerPorId($id);
        if (!$actual) {
            return null;
        }

        $slug = ($nombre !== $actual['nombre']) ? self::generarSlugUnico($nombre, $id) : $actual['slug'];

        $stmt = Database::get()->prepare('UPDATE categorias SET nombre = ?, slug = ? WHERE id = ?');
        $stmt->execute([$nombre, $slug, $id]);

        return self::obtenerPorId($id);
    }

    public static function eliminar(int $id): ?array
    {
        $actual = self::obtenerPorId($id);
        if (!$actual) {
            return null;
        }
        $stmt = Database::get()->prepare('DELETE FROM categorias WHERE id = ?');
        $stmt->execute([$id]);
        return $actual;
    }
}
