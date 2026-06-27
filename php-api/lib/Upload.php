<?php
defined('MIRAIA_API_BOOT') or die('Acceso directo no permitido.');

require_once __DIR__ . '/Response.php';

/**
 * Subida de imágenes de producto al filesystem local del servidor SiteGround
 * (sin Cloudinary/S3). Equivalente PHP de lo que antes hacía lib/upload.ts
 * en Node — acá es incluso más simple porque PHP puebla $_FILES nativamente.
 */
final class Upload
{
    private const MIME_PERMITIDOS = [
        'image/jpeg' => '.jpg',
        'image/png' => '.png',
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
     * Guarda un archivo subido (entrada cruda de $_FILES['imagen']) y devuelve
     * la ruta relativa pública para persistir en la base de datos.
     * Devuelve null si no se envió ningún archivo (caso válido: imagen opcional).
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
            Response::error('La imagen supera el tamaño máximo permitido (' . round($maxBytes / 1024 / 1024) . 'MB).', 400);
        }

        // Se valida el tipo MIME real del archivo (no el que declara el navegador) con finfo.
        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $mime = $finfo->file($archivo['tmp_name']);

        if (!isset(self::MIME_PERMITIDOS[$mime])) {
            Response::error('Formato de imagen no permitido. Usá JPG, PNG, WEBP o AVIF.', 400);
        }

        $dirAbsoluta = self::dirAbsoluta();
        if (!is_dir($dirAbsoluta) && !mkdir($dirAbsoluta, 0755, true) && !is_dir($dirAbsoluta)) {
            throw new RuntimeException("No se pudo crear el directorio de uploads: {$dirAbsoluta}");
        }

        $nombreUnico = uniqid('', true) . '-' . time() . self::MIME_PERMITIDOS[$mime];
        $nombreUnico = preg_replace('/[^a-zA-Z0-9_\.\-]/', '', $nombreUnico); // sanitiza el nombre final

        $destino = rtrim($dirAbsoluta, '/') . '/' . $nombreUnico;

        if (!move_uploaded_file($archivo['tmp_name'], $destino)) {
            throw new RuntimeException('No se pudo guardar la imagen en el servidor.');
        }

        return rtrim(self::rutaPublicaBase(), '/') . '/' . $nombreUnico;
    }

    /** Borra una imagen previamente subida (al reemplazarla o eliminar el producto). */
    public static function borrarImagenProducto(?string $rutaPublica): void
    {
        if (!$rutaPublica) {
            return;
        }
        $nombreArchivo = basename($rutaPublica);
        $rutaAbsoluta = rtrim(self::dirAbsoluta(), '/') . '/' . $nombreArchivo;
        if (is_file($rutaAbsoluta)) {
            @unlink($rutaAbsoluta);
        }
    }
}
