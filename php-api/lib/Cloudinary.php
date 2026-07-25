<?php
defined('MIRAIA_API_BOOT') or die('Acceso directo no permitido.');

/**
 * Resolución en runtime de imágenes de producto contra Cloudinary.
 * Las imágenes NO se guardan en la DB (migraciones 007 y 008): ya viven
 * subidas por el cliente en Cloudinary bajo
 * miraia/productos/{categoria.slug}/{variante.slug}/, y este helper las
 * lista vía la Search API (requiere API key + secret, por eso corre
 * server-side y no desde el browser). Sin categoría/variante o sin nada
 * subido en esa carpeta → sin imagen, no hay fallback a archivo local.
 *
 * La cuenta usa Dynamic Folder Mode: arrastrar un archivo a una carpeta en la
 * consola de Cloudinary cambia su `asset_folder` (dónde se ve), pero NO su
 * `public_id` (el id real de la imagen, que queda con el nombre autogenerado
 * de la subida, ej. "ALBA_2_nfdmsm"). Por eso NO se puede buscar por prefijo
 * de public_id — hay que usar la Search API filtrando por `asset_folder`.
 * El orden de las imágenes se toma de `display_name` (el nombre editable que
 * se ve en la consola, ej. "01", "02"), no de public_id.
 *
 * Caché en disco (migración 008b): la Search API de Cloudinary tiene un
 * límite de operaciones por hora en la cuenta (plan gratuito: 500/hora).
 * Sin caché, CADA visita al home/detalle de producto (y cada vista previa
 * del admin) dispara requests nuevos — con tráfico normal se agota el
 * límite en minutos y Cloudinary devuelve HTTP 420 hasta que resetea la
 * hora. Por eso cada carpeta se resuelve como máximo una vez cada
 * CACHE_TTL_SEGUNDOS, sin importar cuántas visitas haya mientras tanto.
 */
final class Cloudinary
{
    private const CARPETA_BASE       = 'miraia/productos';
    private const CACHE_TTL_SEGUNDOS = 900; // 15 minutos

    /** Lista, ordenadas por display_name, las URLs de las imágenes de una carpeta. */
    public static function listarImagenesPorPrefijo(string $categoriaSlug, string $varianteSlug): array
    {
        $cacheado = self::leerCache($categoriaSlug, $varianteSlug);
        if ($cacheado !== null) {
            return $cacheado;
        }

        [$apiKey, $apiSecret, $requestUrl] = self::credenciales();

        $ch = curl_init($requestUrl);
        curl_setopt_array($ch, self::opcionesCurl($apiKey, $apiSecret, $categoriaSlug, $varianteSlug));
        $respuesta = curl_exec($ch);
        $status    = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error     = curl_error($ch);

        if ($respuesta === false || $error !== '') {
            throw new RuntimeException("Error al contactar Cloudinary: {$error}");
        }
        if ($status !== 200) {
            throw new RuntimeException("Cloudinary respondió HTTP {$status}: {$respuesta}");
        }

        $urls = self::extraerUrls($respuesta);
        self::escribirCache($categoriaSlug, $varianteSlug, $urls);
        return $urls;
    }

    /**
     * Versión en paralelo (curl_multi) de listarImagenesPorPrefijo, para listados
     * con muchos productos — sin esto, resolver la portada de cada producto en
     * serie sumaría la latencia de Cloudinary una vez por producto. Solo pide a
     * Cloudinary las carpetas que no estén ya en caché.
     *
     * Ante un error puntual de UNA carpeta (timeout, HTTP != 200), esa carpeta
     * devuelve [] en vez de cortar el listado entero — las imágenes son
     * best-effort, nunca deben romper la carga de productos.
     *
     * @param array<string, array{categoriaSlug: string, varianteSlug: string}> $carpetas
     * @return array<string, string[]> mismas claves que $carpetas
     */
    public static function listarImagenesPorPrefijoLote(array $carpetas): array
    {
        if (count($carpetas) === 0) {
            return [];
        }

        $resultado = [];
        $faltantes = [];
        foreach ($carpetas as $clave => $c) {
            $cacheado = self::leerCache($c['categoriaSlug'], $c['varianteSlug']);
            if ($cacheado !== null) {
                $resultado[$clave] = $cacheado;
            } else {
                $faltantes[$clave] = $c;
            }
        }

        if (count($faltantes) === 0) {
            return $resultado;
        }

        [$apiKey, $apiSecret, $requestUrl] = self::credenciales();

        $multi   = curl_multi_init();
        $handles = [];
        foreach ($faltantes as $clave => $c) {
            $ch = curl_init($requestUrl);
            curl_setopt_array($ch, self::opcionesCurl($apiKey, $apiSecret, $c['categoriaSlug'], $c['varianteSlug']));
            curl_multi_add_handle($multi, $ch);
            $handles[$clave] = $ch;
        }

        $activos = null;
        do {
            $estado = curl_multi_exec($multi, $activos);
            if ($activos) {
                curl_multi_select($multi);
            }
        } while ($activos && $estado === CURLM_OK);

        foreach ($handles as $clave => $ch) {
            $status    = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $respuesta = $status === 200 ? curl_multi_getcontent($ch) : false;
            $urls      = $respuesta !== false ? self::extraerUrls($respuesta) : [];
            $resultado[$clave] = $urls;
            self::escribirCache($faltantes[$clave]['categoriaSlug'], $faltantes[$clave]['varianteSlug'], $urls);
            curl_multi_remove_handle($multi, $ch);
        }
        curl_multi_close($multi);

        return $resultado;
    }

    // ── Caché en disco ───────────────────────────────────────────────────────

    private static function cacheDir(): string
    {
        $configurada = env('CLOUDINARY_CACHE_PATH');
        // Dentro de php-api/, no en la raíz pública — bloqueado en php-api/.htaccess
        // igual que lib/, para no exponer estos archivos por URL directa.
        return $configurada ?: __DIR__ . '/../cache';
    }

    private static function cacheArchivo(string $categoriaSlug, string $varianteSlug): string
    {
        return rtrim(self::cacheDir(), '/') . '/' . md5("{$categoriaSlug}/{$varianteSlug}") . '.json';
    }

    /** @return string[]|null null = sin caché válida (hay que pedirle a Cloudinary) */
    private static function leerCache(string $categoriaSlug, string $varianteSlug): ?array
    {
        $ruta = self::cacheArchivo($categoriaSlug, $varianteSlug);
        if (!is_file($ruta)) {
            return null;
        }
        $datos = json_decode((string) file_get_contents($ruta), true);
        if (!is_array($datos) || !isset($datos['expira'], $datos['urls']) || $datos['expira'] < time()) {
            return null;
        }
        return $datos['urls'];
    }

    /** Best-effort: si no se puede escribir el caché (permisos, disco), no rompe el request. */
    private static function escribirCache(string $categoriaSlug, string $varianteSlug, array $urls): void
    {
        $dir = self::cacheDir();
        if (!is_dir($dir) && !@mkdir($dir, 0755, true) && !is_dir($dir)) {
            return;
        }
        @file_put_contents(
            self::cacheArchivo($categoriaSlug, $varianteSlug),
            json_encode(['expira' => time() + self::CACHE_TTL_SEGUNDOS, 'urls' => $urls])
        );
    }

    // ── Interno ───────────────────────────────────────────────────────────────

    /** @return array{0: string, 1: string, 2: string} [apiKey, apiSecret, url de la Search API] */
    private static function credenciales(): array
    {
        $cloudName = env('CLOUDINARY_CLOUD_NAME');
        $apiKey    = env('CLOUDINARY_API_KEY');
        $apiSecret = env('CLOUDINARY_API_SECRET');

        if (!$cloudName || !$apiKey || !$apiSecret) {
            throw new RuntimeException(
                'Faltan variables de entorno de Cloudinary (CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET).'
            );
        }

        return [$apiKey, $apiSecret, 'https://api.cloudinary.com/v1_1/' . rawurlencode($cloudName) . '/resources/search'];
    }

    private static function opcionesCurl(string $apiKey, string $apiSecret, string $categoriaSlug, string $varianteSlug): array
    {
        $carpeta   = self::CARPETA_BASE . "/{$categoriaSlug}/{$varianteSlug}";
        $expresion = 'resource_type:image AND asset_folder="' . addslashes($carpeta) . '"';

        return [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_USERPWD        => "{$apiKey}:{$apiSecret}",
            CURLOPT_TIMEOUT        => 10,
            CURLOPT_POST           => true,
            CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
            CURLOPT_POSTFIELDS     => json_encode(['expression' => $expresion, 'max_results' => 100]),
        ];
    }

    /** Parsea la respuesta de la Search API a URLs ordenadas por display_name. */
    private static function extraerUrls(string $respuestaJson): array
    {
        $datos    = json_decode($respuestaJson, true);
        $recursos = is_array($datos['resources'] ?? null) ? $datos['resources'] : [];

        usort(
            $recursos,
            fn (array $a, array $b) => strcmp(
                $a['display_name'] ?? $a['public_id'] ?? '',
                $b['display_name'] ?? $b['public_id'] ?? ''
            )
        );

        return array_values(array_filter(array_map(
            fn (array $r) => $r['secure_url'] ?? null,
            $recursos
        )));
    }
}
