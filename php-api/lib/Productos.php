<?php
defined('MIRAIA_API_BOOT') or die('Acceso directo no permitido.');

require_once __DIR__ . '/Database.php';
require_once __DIR__ . '/Variantes.php';
require_once __DIR__ . '/Cloudinary.php';

/**
 * Capa de acceso a datos para `productos`.
 * Un producto es una serie: nombre + subtítulo + descripciones + categoría +
 * variantes de color (migraciones 007 y 008). Sin catálogos (migración 003);
 * los textos volvieron en la migración 004. Ninguna imagen se sube ni se
 * guarda: tanto la galería por variante como la "imagen principal" (la
 * primera imagen de la primera variante) se resuelven en runtime contra
 * Cloudinary (ver php-api/lib/Cloudinary.php). Sin categoría, sin variantes,
 * o sin nada subido en Cloudinary → imagenPrincipal queda en null, nunca
 * rompe la carga del producto.
 */
final class Productos
{
    private const SELECT_BASE = 'SELECT p.*, c.nombre AS categoria_nombre, c.slug AS categoria_slug
        FROM productos p
        LEFT JOIN categorias c ON c.id = p.categoria_id';

    /** Convierte una fila cruda de MySQL (snake_case) a camelCase para el frontend. */
    public static function mapRow(array $fila, array $variantes = [], ?string $imagenPrincipal = null): array
    {
        // Migración 006 — certificados: JSON array de {nombre, ruta}
        $certRaw      = $fila['certificados'] ?? null;
        $certificados = $certRaw ? json_decode($certRaw, true) : [];
        if (!is_array($certificados)) {
            $certificados = [];
        }

        $categoriaId = $fila['categoria_id'] ?? null;
        $categoria   = $categoriaId ? [
            'id'     => (int) $categoriaId,
            'nombre' => $fila['categoria_nombre'],
            'slug'   => $fila['categoria_slug'],
        ] : null;

        return [
            'id'              => (int) $fila['id'],
            'slug'            => $fila['slug'],
            'nombre'          => $fila['nombre'],
            // Migración 005 — línea de negocio (define la URL pública)
            'linea'           => $fila['linea'] ?? 'alfombra-modular',
            // Migración 007 — categoría + variantes de color
            'categoriaId'     => $categoriaId ? (int) $categoriaId : null,
            'categoria'       => $categoria,
            'variantes'       => $variantes,
            'subtitulo'       => $fila['subtitulo'],
            'descripcionCorta'=> $fila['descripcion_corta'],
            'descripcionLarga'=> $fila['descripcion_larga'],
            // Migración 006 — texto plano "Clave: Valor" por línea
            'especificaciones'=> $fila['especificaciones'] ?? null,
            // Migración 008 — resuelta contra Cloudinary, no se guarda en la DB
            'imagenPrincipal' => $imagenPrincipal,
            'certificados'    => $certificados,
            'destacado'       => (bool) $fila['destacado'],
            'activo'          => (bool) $fila['activo'],
            'orden'           => (int) $fila['orden'],
            'createdAt'       => $fila['created_at'],
            'updatedAt'       => $fila['updated_at'],
        ];
    }

    public static function listar(bool $soloActivos): array
    {
        $where = $soloActivos ? 'WHERE p.activo = 1' : '';
        $sql   = self::SELECT_BASE . " {$where} ORDER BY p.orden ASC, p.created_at DESC";
        $filas = Database::get()->query($sql)->fetchAll();

        $variantesPorProducto = Variantes::listarAgrupadasPorProductos(array_column($filas, 'id'));
        $portadas             = self::resolverPortadasEnLote($filas, $variantesPorProducto);

        return array_map(
            fn (array $fila) => self::mapRow(
                $fila,
                $variantesPorProducto[(int) $fila['id']] ?? [],
                $portadas[(int) $fila['id']] ?? null
            ),
            $filas
        );
    }

    public static function obtenerPorSlug(string $slug): ?array
    {
        $stmt = Database::get()->prepare(self::SELECT_BASE . ' WHERE p.slug = ? LIMIT 1');
        $stmt->execute([$slug]);
        $fila = $stmt->fetch();
        if (!$fila) {
            return null;
        }
        $variantes = Variantes::listarPorProducto((int) $fila['id']);
        return self::mapRow($fila, $variantes, self::resolverPortada($fila, $variantes));
    }

    public static function obtenerPorId(int $id): ?array
    {
        $stmt = Database::get()->prepare(self::SELECT_BASE . ' WHERE p.id = ? LIMIT 1');
        $stmt->execute([$id]);
        $fila = $stmt->fetch();
        if (!$fila) {
            return null;
        }
        $variantes = Variantes::listarPorProducto($id);
        return self::mapRow($fila, $variantes, self::resolverPortada($fila, $variantes));
    }

    // ── Portada (Cloudinary) ─────────────────────────────────────────────────

    /** Primera imagen de la primera variante del producto, o null. Nunca lanza. */
    private static function resolverPortada(array $fila, array $variantes): ?string
    {
        if (!$fila['categoria_slug'] || count($variantes) === 0) {
            return null;
        }
        try {
            $imagenes = Cloudinary::listarImagenesPorPrefijo($fila['categoria_slug'], $variantes[0]['slug']);
            return $imagenes[0] ?? null;
        } catch (Throwable $e) {
            error_log('[MIRAIA API] Cloudinary (portada producto ' . $fila['id'] . '): ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Igual que resolverPortada pero para un listado entero — una sola tanda
     * de pedidos en paralelo en vez de uno por producto en serie.
     *
     * @param array<int, array<int, array>> $variantesPorProducto
     * @return array<int, string|null> productoId => URL de portada
     */
    private static function resolverPortadasEnLote(array $filas, array $variantesPorProducto): array
    {
        $carpetas = [];
        foreach ($filas as $fila) {
            $variantes = $variantesPorProducto[(int) $fila['id']] ?? [];
            if ($fila['categoria_slug'] && count($variantes) > 0) {
                $carpetas[(int) $fila['id']] = [
                    'categoriaSlug' => $fila['categoria_slug'],
                    'varianteSlug'  => $variantes[0]['slug'],
                ];
            }
        }
        if (count($carpetas) === 0) {
            return [];
        }

        try {
            $porCarpeta = Cloudinary::listarImagenesPorPrefijoLote($carpetas);
        } catch (Throwable $e) {
            error_log('[MIRAIA API] Cloudinary (portadas en lote): ' . $e->getMessage());
            return [];
        }

        $portadas = [];
        foreach ($carpetas as $productoId => $c) {
            $portadas[$productoId] = $porCarpeta[$productoId][0] ?? null;
        }
        return $portadas;
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
            $stmt = $db->prepare('SELECT id FROM productos WHERE slug = ? AND id != ? LIMIT 1');
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
     * @param array $datos nombre, subtitulo?, descripcionCorta?, descripcionLarga?,
     *                     categoriaId?, destacado?, activo?, orden?
     */
    public static function crear(array $datos, array $certificados = []): array
    {
        $db   = Database::get();
        $slug = self::generarSlugUnico($datos['nombre']);

        $stmt = $db->prepare(
            'INSERT INTO productos
                (slug, nombre, linea, categoria_id, subtitulo, descripcion_corta, descripcion_larga,
                 especificaciones, certificados, destacado, activo, orden)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            $slug,
            $datos['nombre'],
            $datos['linea'] ?? 'alfombra-modular',
            $datos['categoriaId'] ?? null,
            $datos['subtitulo'] ?? null,
            $datos['descripcionCorta'] ?? null,
            $datos['descripcionLarga'] ?? null,
            $datos['especificaciones'] ?? null,
            count($certificados) > 0 ? json_encode(array_values($certificados)) : null,
            !empty($datos['destacado']) ? 1 : 0,
            isset($datos['activo']) ? (int) (bool) $datos['activo'] : 1,
            (int) ($datos['orden'] ?? 0),
        ]);

        return self::obtenerPorId((int) $db->lastInsertId());
    }

    public static function actualizar(int $id, array $datos, ?array $nuevosCertificados = null): ?array
    {
        $actual = self::obtenerPorId($id);
        if (!$actual) {
            return null;
        }

        $nombre = $datos['nombre'] ?? $actual['nombre'];
        $slug   = ($nombre !== $actual['nombre']) ? self::generarSlugUnico($nombre, $id) : $actual['slug'];

        $certificados = $nuevosCertificados ?? $actual['certificados'];

        $stmt = Database::get()->prepare(
            'UPDATE productos SET
                slug = ?, nombre = ?, linea = ?, categoria_id = ?, subtitulo = ?, descripcion_corta = ?,
                descripcion_larga = ?, especificaciones = ?, certificados = ?,
                destacado = ?, activo = ?, orden = ?
             WHERE id = ?'
        );
        $stmt->execute([
            $slug,
            $nombre,
            $datos['linea'] ?? $actual['linea'],
            array_key_exists('categoriaId', $datos) ? $datos['categoriaId'] : $actual['categoriaId'],
            array_key_exists('subtitulo', $datos) ? $datos['subtitulo'] : $actual['subtitulo'],
            array_key_exists('descripcionCorta', $datos) ? $datos['descripcionCorta'] : $actual['descripcionCorta'],
            array_key_exists('descripcionLarga', $datos) ? $datos['descripcionLarga'] : $actual['descripcionLarga'],
            array_key_exists('especificaciones', $datos) ? $datos['especificaciones'] : $actual['especificaciones'],
            count($certificados) > 0 ? json_encode(array_values($certificados)) : null,
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
