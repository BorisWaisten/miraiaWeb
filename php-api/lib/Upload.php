<?php
defined('MIRAIA_API_BOOT') or die('Acceso directo no permitido.');

require_once __DIR__ . '/Response.php';

/**
 * Subida de imágenes de producto al filesystem local del servidor SiteGround.
 * Soporta una imagen principal (imagen_1) y hasta 2 imágenes adicionales
 * (imagen_2, imagen_3) que se almacenan en `imagenes_galeria` JSON.
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
        return $configurada ?: __DIR__ . '/../../public/uploads/productos';
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
     * Procesa las tres entradas de imagen de un producto (imagen_1, imagen_2, imagen_3)
     * de $_FILES. Devuelve [$imagenPrincipal, $galeriaArray].
     *
     * - $imagenPrincipal: ruta pública o null (si no se envió imagen_1)
     * - $galeriaArray: array (vacío, 1 o 2 elementos) con rutas de imágenes 2 y 3
     *
     * @param array $files       típicamente $_FILES
     * @param array $existentes  ['imagenPrincipal' => ..., 'imagenesGaleria' => [...]]
     *                           del producto existente (solo relevante en edición)
     * @param array $borrar      flags de borrado: ['imagen_1' => true, 'imagen_2' => true, ...]
     */
    public static function procesarImagenesProducto(
        array $files,
        array $existentes = [],
        array $borrar = []
    ): array {
        // — Imagen principal (imagen_1) —
        $nuevaImagen1 = self::guardarImagenProducto($files['imagen_1'] ?? null);

        if ($nuevaImagen1 !== null && !empty($existentes['imagenPrincipal'])) {
            // Nueva imagen subida: borrar la anterior del disco
            self::borrarImagenProducto($existentes['imagenPrincipal']);
        }
        if ($nuevaImagen1 === null && !empty($borrar['imagen_1']) && !empty($existentes['imagenPrincipal'])) {
            // Sin reemplazo pero se pidió borrar: quitar del disco
            // El caller usa el flag $borrar['imagen_1'] para saber que debe poner NULL en DB
            self::borrarImagenProducto($existentes['imagenPrincipal']);
        }

        // — Imágenes de galería (imagen_2, imagen_3) —
        $galeria = $existentes['imagenesGaleria'] ?? [];

        foreach ([1 => 'imagen_2', 2 => 'imagen_3'] as $idx => $campo) {
            $nueva = self::guardarImagenProducto($files[$campo] ?? null);

            if ($nueva !== null) {
                // Borra la anterior si había
                if (!empty($galeria[$idx - 1])) {
                    self::borrarImagenProducto($galeria[$idx - 1]);
                }
                $galeria[$idx - 1] = $nueva;
            } elseif (!empty($borrar[$campo]) && !empty($galeria[$idx - 1])) {
                self::borrarImagenProducto($galeria[$idx - 1]);
                unset($galeria[$idx - 1]);
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
