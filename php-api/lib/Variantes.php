<?php
defined('MIRAIA_API_BOOT') or die('Acceso directo no permitido.');

require_once __DIR__ . '/Database.php';

/**
 * Capa de acceso a datos para `variantes` (migración 007).
 * Una variante es un color/opción de un producto (ej. "Rubí"). Sin imágenes
 * propias en la DB: se resuelven en runtime contra Cloudinary usando
 * categoria.slug + variante.slug (ver php-api/lib/Cloudinary.php).
 */
final class Variantes
{
    public static function mapRow(array $fila): array
    {
        return [
            'id'         => (int) $fila['id'],
            'productoId' => (int) $fila['producto_id'],
            'nombre'     => $fila['nombre'],
            'slug'       => $fila['slug'],
            'createdAt'  => $fila['created_at'],
            'updatedAt'  => $fila['updated_at'],
        ];
    }

    public static function listarPorProducto(int $productoId): array
    {
        $stmt = Database::get()->prepare('SELECT * FROM variantes WHERE producto_id = ? ORDER BY id ASC');
        $stmt->execute([$productoId]);
        return array_map(self::mapRow(...), $stmt->fetchAll());
    }

    /** @param int[] $productoIds @return array<int, array> productoId => variantes[] */
    public static function listarAgrupadasPorProductos(array $productoIds): array
    {
        $productoIds = array_values(array_unique(array_map('intval', $productoIds)));
        if (count($productoIds) === 0) {
            return [];
        }

        $marcadores = implode(',', array_fill(0, count($productoIds), '?'));
        $stmt = Database::get()->prepare(
            "SELECT * FROM variantes WHERE producto_id IN ({$marcadores}) ORDER BY id ASC"
        );
        $stmt->execute($productoIds);

        $agrupadas = [];
        foreach ($stmt->fetchAll() as $fila) {
            $agrupadas[(int) $fila['producto_id']][] = self::mapRow($fila);
        }
        return $agrupadas;
    }

    public static function obtenerPorId(int $id): ?array
    {
        $stmt = Database::get()->prepare('SELECT * FROM variantes WHERE id = ? LIMIT 1');
        $stmt->execute([$id]);
        $fila = $stmt->fetch();
        return $fila ? self::mapRow($fila) : null;
    }

    // ── Slug ─────────────────────────────────────────────────────────────────
    // Único por producto (no globalmente): dos productos distintos pueden
    // tener variantes con el mismo nombre/slug (ej. "Negro").

    private static function slugify(string $texto): string
    {
        $texto = strtolower($texto);
        $texto = iconv('UTF-8', 'ASCII//TRANSLIT', $texto) ?: $texto;
        $texto = preg_replace('/[^a-z0-9]+/', '-', $texto);
        return trim($texto, '-');
    }

    private static function generarSlugUnico(int $productoId, string $nombre, int $idAExcluir = 0): string
    {
        $base      = self::slugify($nombre);
        $candidato = $base;
        $sufijo    = 1;
        $db        = Database::get();
        while (true) {
            $stmt = $db->prepare(
                'SELECT id FROM variantes WHERE producto_id = ? AND slug = ? AND id != ? LIMIT 1'
            );
            $stmt->execute([$productoId, $candidato, $idAExcluir]);
            if (!$stmt->fetch()) {
                return $candidato;
            }
            $sufijo++;
            $candidato = "{$base}-{$sufijo}";
        }
    }

    // ── CRUD ─────────────────────────────────────────────────────────────────

    public static function crear(int $productoId, string $nombre): array
    {
        $db   = Database::get();
        $slug = self::generarSlugUnico($productoId, $nombre);

        $stmt = $db->prepare('INSERT INTO variantes (producto_id, nombre, slug) VALUES (?, ?, ?)');
        $stmt->execute([$productoId, $nombre, $slug]);

        return self::obtenerPorId((int) $db->lastInsertId());
    }

    public static function actualizar(int $id, string $nombre): ?array
    {
        $actual = self::obtenerPorId($id);
        if (!$actual) {
            return null;
        }

        $slug = ($nombre !== $actual['nombre'])
            ? self::generarSlugUnico($actual['productoId'], $nombre, $id)
            : $actual['slug'];

        $stmt = Database::get()->prepare('UPDATE variantes SET nombre = ?, slug = ? WHERE id = ?');
        $stmt->execute([$nombre, $slug, $id]);

        return self::obtenerPorId($id);
    }

    public static function eliminar(int $id): ?array
    {
        $actual = self::obtenerPorId($id);
        if (!$actual) {
            return null;
        }
        $stmt = Database::get()->prepare('DELETE FROM variantes WHERE id = ?');
        $stmt->execute([$id]);
        return $actual;
    }
}
