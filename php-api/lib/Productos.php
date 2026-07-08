<?php
defined('MIRAIA_API_BOOT') or die('Acceso directo no permitido.');

require_once __DIR__ . '/Database.php';

/**
 * Capa de acceso a datos para `productos`.
 * Un producto es una serie: nombre + subtítulo + descripciones + imagen
 * principal + galería de imágenes (variantes). Sin catálogos (migración 003);
 * los textos volvieron en la migración 004.
 */
final class Productos
{
    /** Convierte una fila cruda de MySQL (snake_case) a camelCase para el frontend. */
    public static function mapRow(array $fila): array
    {
        $galeriaRaw = $fila['imagenes_galeria'] ?? null;
        $galeria    = $galeriaRaw ? json_decode($galeriaRaw, true) : [];
        if (!is_array($galeria)) {
            $galeria = [];
        }

        return [
            'id'              => (int) $fila['id'],
            'slug'            => $fila['slug'],
            'nombre'          => $fila['nombre'],
            'subtitulo'       => $fila['subtitulo'],
            'descripcionCorta'=> $fila['descripcion_corta'],
            'descripcionLarga'=> $fila['descripcion_larga'],
            'imagenPrincipal' => $fila['imagen_principal'],
            'imagenesGaleria' => $galeria,
            'destacado'       => (bool) $fila['destacado'],
            'activo'          => (bool) $fila['activo'],
            'orden'           => (int) $fila['orden'],
            'createdAt'       => $fila['created_at'],
            'updatedAt'       => $fila['updated_at'],
        ];
    }

    public static function listar(bool $soloActivos): array
    {
        $where = $soloActivos ? 'WHERE activo = 1' : '';
        $sql   = "SELECT * FROM productos {$where} ORDER BY orden ASC, created_at DESC";
        return array_map(self::mapRow(...), Database::get()->query($sql)->fetchAll());
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
     * @param array       $datos           nombre, subtitulo?, descripcionCorta?,
     *                                     descripcionLarga?, destacado?, activo?, orden?
     * @param string|null $imagenPrincipal ruta pública de la imagen principal (o null)
     * @param array       $imagenesGaleria rutas públicas de la galería
     */
    public static function crear(array $datos, ?string $imagenPrincipal, array $imagenesGaleria = []): array
    {
        $db   = Database::get();
        $slug = self::generarSlugUnico($datos['nombre']);

        $stmt = $db->prepare(
            'INSERT INTO productos
                (slug, nombre, subtitulo, descripcion_corta, descripcion_larga,
                 imagen_principal, imagenes_galeria, destacado, activo, orden)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            $slug,
            $datos['nombre'],
            $datos['subtitulo'] ?? null,
            $datos['descripcionCorta'] ?? null,
            $datos['descripcionLarga'] ?? null,
            $imagenPrincipal,
            count($imagenesGaleria) > 0 ? json_encode(array_values($imagenesGaleria)) : null,
            !empty($datos['destacado']) ? 1 : 0,
            isset($datos['activo']) ? (int) (bool) $datos['activo'] : 1,
            (int) ($datos['orden'] ?? 0),
        ]);

        return self::obtenerPorId((int) $db->lastInsertId());
    }

    /**
     * @param string|null $nuevaImagen          ruta de imagen principal nueva (null = sin cambio o borrar)
     * @param array|null  $nuevaGaleria         galería final (null = sin cambio)
     * @param bool        $borrarImagenPrincipal true = limpiar imagen_principal aunque no haya nueva
     */
    public static function actualizar(
        int    $id,
        array  $datos,
        ?string $nuevaImagen,
        ?array  $nuevaGaleria,
        bool   $borrarImagenPrincipal = false
    ): ?array {
        $actual = self::obtenerPorId($id);
        if (!$actual) {
            return null;
        }

        $nombre = $datos['nombre'] ?? $actual['nombre'];
        $slug   = ($nombre !== $actual['nombre']) ? self::generarSlugUnico($nombre, $id) : $actual['slug'];

        // Imagen principal: nueva > borrar > mantener existente
        $imagenFinal = $nuevaImagen ?? ($borrarImagenPrincipal ? null : $actual['imagenPrincipal']);

        $galeria = $nuevaGaleria ?? $actual['imagenesGaleria'];

        $stmt = Database::get()->prepare(
            'UPDATE productos SET
                slug = ?, nombre = ?, subtitulo = ?, descripcion_corta = ?,
                descripcion_larga = ?, imagen_principal = ?, imagenes_galeria = ?,
                destacado = ?, activo = ?, orden = ?
             WHERE id = ?'
        );
        $stmt->execute([
            $slug,
            $nombre,
            array_key_exists('subtitulo', $datos) ? $datos['subtitulo'] : $actual['subtitulo'],
            array_key_exists('descripcionCorta', $datos) ? $datos['descripcionCorta'] : $actual['descripcionCorta'],
            array_key_exists('descripcionLarga', $datos) ? $datos['descripcionLarga'] : $actual['descripcionLarga'],
            $imagenFinal,
            count($galeria) > 0 ? json_encode(array_values($galeria)) : null,
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
