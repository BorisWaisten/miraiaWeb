<?php
defined('MIRAIA_API_BOOT') or die('Acceso directo no permitido.');

require_once __DIR__ . '/Response.php';

/**
 * Subida de archivos de producto al filesystem local del servidor SiteGround.
 * Desde la migración 008 esto es solo para certificados (PDF) — las
 * imágenes de producto (principal y por variante) ya no se suben como
 * archivo, se resuelven en runtime contra Cloudinary
 * (ver php-api/lib/Cloudinary.php).
 */
final class Upload
{
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
     * Certificados PDF de un producto (migración 006).
     * Formato almacenado: array de {nombre, ruta} — nombre = filename original
     * para mostrar, ruta = archivo único en disco.
     *
     * - certificados[] ($_FILES múltiple): PDFs nuevos que se AGREGAN
     * - $conservar: rutas existentes que se mantienen (null = mantener todas)
     */
    public static function procesarCertificados(
        array $files,
        array $existentes = [],
        ?array $conservar = null
    ): array {
        $actuales = $existentes['certificados'] ?? [];
        $finales  = $conservar === null
            ? $actuales
            : array_values(array_filter($actuales, fn ($c) => in_array($c['ruta'] ?? '', $conservar, true)));

        // Borrar del disco los existentes que no se conservan
        foreach (array_udiff($actuales, $finales, fn ($a, $b) => strcmp($a['ruta'] ?? '', $b['ruta'] ?? '')) as $cert) {
            self::borrarArchivo($cert['ruta'] ?? null);
        }

        $lote = $files['certificados'] ?? null;
        if ($lote !== null && is_array($lote['name'] ?? null)) {
            foreach (array_keys($lote['name']) as $i) {
                if (($lote['error'][$i] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_NO_FILE) {
                    continue;
                }
                if ($lote['error'][$i] !== UPLOAD_ERR_OK) {
                    Response::error('Error al subir el certificado (código ' . $lote['error'][$i] . ').', 400);
                }
                $finfo = new finfo(FILEINFO_MIME_TYPE);
                if ($finfo->file($lote['tmp_name'][$i]) !== 'application/pdf') {
                    Response::error('Los certificados deben ser archivos PDF.', 400);
                }
                $finales[] = [
                    'nombre' => basename($lote['name'][$i]),
                    'ruta'   => self::moverArchivo($lote['tmp_name'][$i], '.pdf'),
                ];
            }
        }

        return array_values($finales);
    }

    /** Borra un archivo previamente subido (al reemplazarlo o eliminar el producto). */
    public static function borrarArchivo(?string $rutaPublica): void
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

    /** Borra los certificados de un producto (al eliminarlo). */
    public static function borrarCertificados(array $producto): void
    {
        foreach ($producto['certificados'] ?? [] as $cert) {
            self::borrarArchivo($cert['ruta'] ?? null);
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
            throw new RuntimeException('No se pudo guardar el archivo en el servidor.');
        }

        return rtrim(self::rutaPublicaBase(), '/') . '/' . $nombreUnico;
    }
}
