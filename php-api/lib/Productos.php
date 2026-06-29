<?php
defined('MIRAIA_API_BOOT') or die('Acceso directo no permitido.');

require_once __DIR__ . '/Database.php';

/**
 * Capa de acceso a datos para `productos`.
 * Desde la migración 001, la columna `categoria` (ENUM) fue reemplazada por
 * `catalogo_id` (FK → catalogos.id). Todas las queries hacen JOIN con catalogos
 * para devolver `catalogoId`, `catalogoSlug` y `catalogoNombre` en cada producto.
 * El campo `imagenes_galeria` (JSON) almacena hasta 2 rutas adicionales (imágenes 2 y 3).
 */
final class Productos
{
    /** Base SELECT reutilizable — siempre incluye datos del catálogo asociado. */
    private const SQL_SELECT = '
        SELECT p.*,
               c.slug  AS catalogo_slug,
               c.nombre AS catalogo_nombre
        FROM productos p
        JOIN catalogos c ON c.id = p.catalogo_id
    ';

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
            'catalogoId'      => (int) $fila['catalogo_id'],
            'catalogoSlug'    => $fila['catalogo_slug'],
            'catalogoNombre'  => $fila['catalogo_nombre'],
            'descripcionCorta'=> $fila['descripcion_corta'],
            'descripcionLarga'=> $fila['descripcion_larga'],
            'especificaciones'=> $fila['especificaciones'] ? json_decode($fila['especificaciones'], true) : null,
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
        $where = $soloActivos ? 'WHERE p.activo = 1' : '';
        $sql   = self::SQL_SELECT . $where . ' ORDER BY p.orden ASC, p.created_at DESC';
        return array_map(self::mapRow(...), Database::get()->query($sql)->fetchAll());
    }

    public static function listarPorCatalogo(string $catalogoSlug, bool $soloActivos = true): array
    {
        $where = $soloActivos ? 'WHERE p.activo = 1 AND c.slug = ?' : 'WHERE c.slug = ?';
        $sql   = self::SQL_SELECT . $where . ' ORDER BY p.orden ASC, p.created_at DESC';
        $stmt  = Database::get()->prepare($sql);
        $stmt->execute([$catalogoSlug]);
        return array_map(self::mapRow(...), $stmt->fetchAll());
    }

    public static function obtenerPorSlug(string $slug): ?array
    {
        $stmt = Database::get()->prepare(self::SQL_SELECT . 'WHERE p.slug = ? LIMIT 1');
        $stmt->execute([$slug]);
        $fila = $stmt->fetch();
        return $fila ? self::mapRow($fila) : null;
    }

    public static function obtenerPorId(int $id): ?array
    {
        $stmt = Database::get()->prepare(self::SQL_SELECT . 'WHERE p.id = ? LIMIT 1');
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
     * @param array       $datos           nombre, catalogoId, descripcionCorta, descripcionLarga?,
     *                                     especificaciones?, destacado?, activo?, orden?
     * @param string|null $imagenPrincipal ruta pública de imagen 1 (o null)
     * @param array       $imagenesGaleria rutas públicas de imágenes 2 y 3 (array, puede estar vacío)
     */
    public static function crear(array $datos, ?string $imagenPrincipal, array $imagenesGaleria = []): array
    {
        $db   = Database::get();
        $slug = self::generarSlugUnico($datos['nombre']);

        $galeriaJson = count($imagenesGaleria) > 0 ? json_encode(array_values($imagenesGaleria)) : null;

        $stmt = $db->prepare(
            'INSERT INTO productos
                (slug, nombre, catalogo_id, descripcion_corta, descripcion_larga, especificaciones,
                 imagen_principal, imagenes_galeria, destacado, activo, orden)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            $slug,
            $datos['nombre'],
            (int) $datos['catalogoId'],
            $datos['descripcionCorta'],
            $datos['descripcionLarga'] ?? null,
            isset($datos['especificaciones']) ? json_encode($datos['especificaciones']) : null,
            $imagenPrincipal,
            $galeriaJson,
            !empty($datos['destacado']) ? 1 : 0,
            isset($datos['activo']) ? (int) (bool) $datos['activo'] : 1,
            (int) ($datos['orden'] ?? 0),
        ]);

        return self::obtenerPorId((int) $db->lastInsertId());
    }

    /**
     * @param int         $id
     * @param array       $datos
     * @param string|null $nuevaImagen          ruta de imagen principal nueva (null = sin cambio o borrar)
     * @param array|null  $nuevaGaleria          array actualizado para galería (null = sin cambio)
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

        // Galería: si se pasa $nuevaGaleria (puede ser array vacío), se usa; si null, mantener existente
        if ($nuevaGaleria !== null) {
            $galeriaJson = count($nuevaGaleria) > 0 ? json_encode(array_values($nuevaGaleria)) : null;
        } else {
            $galeriaJson = count($actual['imagenesGaleria']) > 0
                ? json_encode($actual['imagenesGaleria'])
                : null;
        }

        $stmt = Database::get()->prepare(
            'UPDATE productos SET
                slug = ?, nombre = ?, catalogo_id = ?, descripcion_corta = ?, descripcion_larga = ?,
                especificaciones = ?, imagen_principal = ?,
                imagenes_galeria = ?, destacado = ?, activo = ?, orden = ?
             WHERE id = ?'
        );
        $stmt->execute([
            $slug,
            $nombre,
            isset($datos['catalogoId']) ? (int) $datos['catalogoId'] : $actual['catalogoId'],
            $datos['descripcionCorta'] ?? $actual['descripcionCorta'],
            $datos['descripcionLarga'] ?? $actual['descripcionLarga'],
            isset($datos['especificaciones'])
                ? json_encode($datos['especificaciones'])
                : ($actual['especificaciones'] ? json_encode($actual['especificaciones']) : null),
            $imagenFinal,
            $galeriaJson,
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
