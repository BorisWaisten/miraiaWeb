<?php
defined('MIRAIA_API_BOOT') or die('Acceso directo no permitido.');

require_once __DIR__ . '/Response.php';

/**
 * Subida de imágenes de producto al filesystem local del servidor SiteGround.
 * Soporta una imagen principal (imagen_1) y una galería de N imágenes
 * (input múltiple `galeria[]`) almacenada en `imagenes_galeria` JSON.
 */
final class Upload
{
    private const MIME_PERMITIDOS = [
        'image/jpeg' => '.jpg',
        'image/png'  => '.png',
        'image/webp' => '.webp',
        'image/avif' => '.avif',
    ];

    private static function dirAbsoluta(): string
    {
        $configurada = env('UPLOADS_ABS_PATH');
        return $configurada ?: __DIR__ . '/../../uploads/productos';
    }

    private static function rutaPublicaBase(): string
    {
        return env('UPLOADS_PUBLIC_PATH', '/uploads/productos');
    }

    /**
     * Guarda un único archivo subido. Devuelve la ruta relativa pública, o null
     * si no se envió archivo (imagen opcional).
     */
    public static function guardarImagenProducto(?array $archivo): ?string
    {
        if ($archivo === null || ($archivo['error'] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_NO_FILE) {
            return null;
        }

        if ($archivo['error'] !== UPLOAD_ERR_OK) {
            Response::error('Error al subir la imagen (código ' . $archivo['error'] . ').', 400);
        }

        $maxBytes = (int) env('UPLOAD_MAX_BYTES', (string) (5 * 1024 * 1024));
        if ($archivo['size'] > $maxBytes) {
            Response::error(
                'La imagen supera el tamaño máximo permitido (' . round($maxBytes / 1024 / 1024) . 'MB).',
                400
            );
        }

        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $mime  = $finfo->file($archivo['tmp_name']);

        if (!isset(self::MIME_PERMITIDOS[$mime])) {
            Response::error('Formato de imagen no permitido. Usá JPG, PNG, WEBP o AVIF.', 400);
        }

        return self::moverArchivo($archivo['tmp_name'], self::MIME_PERMITIDOS[$mime]);
    }

    /**
     * Procesa las imágenes de un producto. Devuelve [$imagenPrincipal, $galeriaArray].
     *
     * - imagen_1 ($_FILES): imagen principal nueva (opcional)
     * - galeria[] ($_FILES múltiple): imágenes nuevas que se AGREGAN a la galería
     * - $galeriaConservar: rutas existentes que se mantienen (las que faltan se
     *   borran del disco). null = mantener toda la galería existente.
     *
     * @param array      $files            típicamente $_FILES
     * @param array      $existentes       producto existente (solo en edición)
     * @param bool       $borrarPrincipal  true = borrar imagen principal existente
     * @param array|null $galeriaConservar rutas existentes a conservar
     */
    public static function procesarImagenesProducto(
        array $files,
        array $existentes = [],
        bool $borrarPrincipal = false,
        ?array $galeriaConservar = null
    ): array {
        // — Imagen principal (imagen_1) —
        $nuevaImagen1 = self::guardarImagenProducto($files['imagen_1'] ?? null);

        if (($nuevaImagen1 !== null || $borrarPrincipal) && !empty($existentes['imagenPrincipal'])) {
            self::borrarImagenProducto($existentes['imagenPrincipal']);
        }

        // — Galería —
        $existente = $existentes['imagenesGaleria'] ?? [];
        $galeria   = $galeriaConservar === null
            ? $existente
            : array_values(array_intersect($existente, $galeriaConservar));

        // Borrar del disco las existentes que no se conservan
        foreach (array_diff($existente, $galeria) as $ruta) {
            self::borrarImagenProducto($ruta);
        }

        // Agregar las nuevas (input múltiple `galeria[]` — $_FILES lo entrega como arrays paralelos)
        $lote = $files['galeria'] ?? null;
        if ($lote !== null && is_array($lote['name'] ?? null)) {
            foreach (array_keys($lote['name']) as $i) {
                $archivo = [
                    'name'     => $lote['name'][$i],
                    'tmp_name' => $lote['tmp_name'][$i],
                    'size'     => $lote['size'][$i],
                    'error'    => $lote['error'][$i],
                ];
                $ruta = self::guardarImagenProducto($archivo);
                if ($ruta !== null) {
                    $galeria[] = $ruta;
                }
            }
        }

        return [$nuevaImagen1, array_values($galeria)];
    }

    /** Borra una imagen previamente subida (al reemplazarla o eliminar el producto). */
    public static function borrarImagenProducto(?string $rutaPublica): void
    {
        if (!$rutaPublica) {
            return;
        }
        $nombreArchivo = basename($rutaPublica);
        $rutaAbsoluta  = rtrim(self::dirAbsoluta(), '/') . '/' . $nombreArchivo;
        if (is_file($rutaAbsoluta)) {
            @unlink($rutaAbsoluta);
        }
    }

    /** Borra todas las imágenes de un producto (principal + galería). */
    public static function borrarTodasLasImagenes(array $producto): void
    {
        self::borrarImagenProducto($producto['imagenPrincipal'] ?? null);
        foreach ($producto['imagenesGaleria'] ?? [] as $ruta) {
            self::borrarImagenProducto($ruta);
        }
    }

    // ── Interno ───────────────────────────────────────────────────────────────

    private static function moverArchivo(string $tmpName, string $extension): string
    {
        $dirAbsoluta = self::dirAbsoluta();
        if (!is_dir($dirAbsoluta) && !mkdir($dirAbsoluta, 0755, true) && !is_dir($dirAbsoluta)) {
            throw new RuntimeException("No se pudo crear el directorio de uploads: {$dirAbsoluta}");
        }

        $nombreUnico = uniqid('', true) . '-' . time() . $extension;
        $nombreUnico = preg_replace('/[^a-zA-Z0-9_\.\-]/', '', $nombreUnico);

        $destino = rtrim($dirAbsoluta, '/') . '/' . $nombreUnico;
        if (!move_uploaded_file($tmpName, $destino)) {
            throw new RuntimeException('No se pudo guardar la imagen en el servidor.');
        }

        return rtrim(self::rutaPublicaBase(), '/') . '/' . $nombreUnico;
    }
}
