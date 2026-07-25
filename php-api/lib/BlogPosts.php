<?php
defined('MIRAIA_API_BOOT') or die('Acceso directo no permitido.');

require_once __DIR__ . '/Database.php';

/**
 * Capa de acceso a datos para `blog_posts` (migración 009).
 * `categoria` es texto libre que escribe el admin (no una tabla relacional) —
 * el listado público agrupa por lo que haya cargado. `contenido` se guarda
 * como texto plano con una convención simple (## subtítulo, - lista,
 * **negrita**), parseada en el frontend (src/models/blog.ts) — nunca HTML.
 */
final class BlogPosts
{
    public static function mapRow(array $fila): array
    {
        return [
            'id'             => (int) $fila['id'],
            'slug'           => $fila['slug'],
            'titulo'         => $fila['titulo'],
            'categoria'      => $fila['categoria'],
            'resumen'        => $fila['resumen'],
            'contenido'      => $fila['contenido'],
            'imagenPortada'  => $fila['imagen_portada'],
            'publicado'      => (bool) $fila['publicado'],
            'destacado'      => (bool) $fila['destacado'],
            'orden'          => (int) $fila['orden'],
            'createdAt'      => $fila['created_at'],
            'updatedAt'      => $fila['updated_at'],
        ];
    }

    public static function listar(bool $soloPublicados): array
    {
        $where = $soloPublicados ? 'WHERE publicado = 1' : '';
        $sql   = "SELECT * FROM blog_posts {$where} ORDER BY orden ASC, created_at DESC";
        return array_map(self::mapRow(...), Database::get()->query($sql)->fetchAll());
    }

    public static function obtenerPorSlug(string $slug): ?array
    {
        $stmt = Database::get()->prepare('SELECT * FROM blog_posts WHERE slug = ? LIMIT 1');
        $stmt->execute([$slug]);
        $fila = $stmt->fetch();
        return $fila ? self::mapRow($fila) : null;
    }

    public static function obtenerPorId(int $id): ?array
    {
        $stmt = Database::get()->prepare('SELECT * FROM blog_posts WHERE id = ? LIMIT 1');
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

    private static function generarSlugUnico(string $titulo, int $idAExcluir = 0): string
    {
        $base      = self::slugify($titulo);
        $candidato = $base;
        $sufijo    = 1;
        $db        = Database::get();
        while (true) {
            $stmt = $db->prepare('SELECT id FROM blog_posts WHERE slug = ? AND id != ? LIMIT 1');
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
     * @param array $datos titulo, categoria?, resumen?, contenido,
     *                     imagenPortada?, publicado?, destacado?, orden?
     */
    public static function crear(array $datos): array
    {
        $db   = Database::get();
        $slug = self::generarSlugUnico($datos['titulo']);

        $stmt = $db->prepare(
            'INSERT INTO blog_posts
                (slug, titulo, categoria, resumen, contenido, imagen_portada, publicado, destacado, orden)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            $slug,
            $datos['titulo'],
            $datos['categoria'] ?? null,
            $datos['resumen'] ?? null,
            $datos['contenido'],
            $datos['imagenPortada'] ?? null,
            isset($datos['publicado']) ? (int) (bool) $datos['publicado'] : 1,
            !empty($datos['destacado']) ? 1 : 0,
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

        $titulo = $datos['titulo'] ?? $actual['titulo'];
        $slug   = ($titulo !== $actual['titulo']) ? self::generarSlugUnico($titulo, $id) : $actual['slug'];

        $stmt = Database::get()->prepare(
            'UPDATE blog_posts SET
                slug = ?, titulo = ?, categoria = ?, resumen = ?, contenido = ?,
                imagen_portada = ?, publicado = ?, destacado = ?, orden = ?
             WHERE id = ?'
        );
        $stmt->execute([
            $slug,
            $titulo,
            array_key_exists('categoria', $datos) ? $datos['categoria'] : $actual['categoria'],
            array_key_exists('resumen', $datos) ? $datos['resumen'] : $actual['resumen'],
            $datos['contenido'] ?? $actual['contenido'],
            array_key_exists('imagenPortada', $datos) ? $datos['imagenPortada'] : $actual['imagenPortada'],
            isset($datos['publicado']) ? (int) (bool) $datos['publicado'] : (int) $actual['publicado'],
            isset($datos['destacado']) ? (int) (bool) $datos['destacado'] : (int) $actual['destacado'],
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
        $stmt = Database::get()->prepare('DELETE FROM blog_posts WHERE id = ?');
        $stmt->execute([$id]);
        return $actual;
    }
}
