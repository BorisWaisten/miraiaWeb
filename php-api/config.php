<?php
/**
 * Bootstrap de la API MIRAIA. TODO endpoint (php-api/*.php, php-api/admin/*.php)
 * debe empezar con: require __DIR__ . '/config.php'; (o '../config.php').
 *
 * Responsabilidades:
 *   - Cargar variables de entorno desde .env (sin dependencias externas).
 *   - Configurar manejo de errores (nunca exponer stack traces en producción).
 *   - Setear CORS solo para los orígenes explícitamente permitidos (dev local).
 *   - Definir la constante MIRAIA_API_BOOT que usan las clases en lib/ como guard.
 */

define('MIRAIA_API_BOOT', true);

// ── Carga de .env (formato KEY=VALUE, líneas con # son comentarios) ──
function miraia_cargar_env(string $ruta): void
{
    if (!is_file($ruta)) {
        return;
    }
    foreach (file($ruta, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $linea) {
        $linea = trim($linea);
        if ($linea === '' || str_starts_with($linea, '#') || !str_contains($linea, '=')) {
            continue;
        }
        [$clave, $valor] = explode('=', $linea, 2);
        $clave = trim($clave);
        $valor = trim($valor);
        // Quita comillas envolventes si las hay.
        if (preg_match('/^"(.*)"$/', $valor, $m) || preg_match("/^'(.*)'$/", $valor, $m)) {
            $valor = $m[1];
        }
        // Siempre pisa el valor: putenv() persiste por worker de PHP-FPM entre
        // requests, así que si no pisamos, un worker puede quedar "pegado" a un
        // valor viejo después de editar el .env → comportamiento intermitente.
        putenv("{$clave}={$valor}");
        $_ENV[$clave] = $valor;
    }
}

miraia_cargar_env(__DIR__ . '/.env');

function env(string $clave, ?string $default = null): ?string
{
    $valor = getenv($clave);
    return $valor === false ? $default : $valor;
}

// ── Manejo de errores: nunca exponer detalles internos en la respuesta ──
$esProduccion = env('APP_ENV', 'production') === 'production';
ini_set('display_errors', $esProduccion ? '0' : '1');
error_reporting(E_ALL);

set_exception_handler(function (Throwable $e) use ($esProduccion) {
    error_log('[MIRAIA API] ' . $e->getMessage() . ' @ ' . $e->getFile() . ':' . $e->getLine());
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'error' => $esProduccion ? 'Error interno del servidor.' : $e->getMessage(),
    ]);
    exit;
});

// ── CORS (solo relevante en desarrollo local, cuando Next y PHP están en orígenes distintos) ──
$origenesPermitidos = array_filter(array_map('trim', explode(',', env('CORS_ALLOWED_ORIGINS', '') ?? '')));
$origenRequest = $_SERVER['HTTP_ORIGIN'] ?? '';

if ($origenRequest !== '' && in_array($origenRequest, $origenesPermitidos, true)) {
    header("Access-Control-Allow-Origin: {$origenRequest}");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
}

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// ── Protección CSRF ──
// La cookie de sesión es SameSite=None (necesario para que viaje cross-origin
// desde el frontend en Vercel), así que el browser ya no bloquea que se
// ENVÍE la cookie en un POST disparado desde un sitio de terceros — a
// diferencia de un fetch/XHR con JSON, un <form> multipart no dispara
// preflight de CORS. Mitigación: en métodos que mutan estado, si el browser
// mandó Origin (que es el caso normal en fetch/XHR y en POST cross-site de
// browsers modernos) tiene que ser el propio host o estar en la whitelist.
//
// El same-origin se acepta SIEMPRE, sin depender de CORS_ALLOWED_ORIGINS: un
// POST cuyo Origin es este mismo host viene de una página nuestra, nunca de un
// sitio de terceros. Atarlo a la whitelist dejaba afuera al propio sitio
// (contacto y login devolvían 403 cuando la whitelist solo tenía el dominio
// del front nuevo).
$metodoRequest = $_SERVER['REQUEST_METHOD'] ?? '';
$hostRequest = $_SERVER['HTTP_HOST'] ?? '';
$origenEsPropio = $origenRequest !== '' && $hostRequest !== ''
    && strcasecmp((string) parse_url($origenRequest, PHP_URL_HOST), $hostRequest) === 0;

if (in_array($metodoRequest, ['POST', 'PUT', 'DELETE'], true) && $origenRequest !== '' && !$origenEsPropio && !in_array($origenRequest, $origenesPermitidos, true)) {
    http_response_code(403);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['error' => 'Origen no permitido.']);
    exit;
}

header('Content-Type: application/json; charset=utf-8');
// Evita que SiteGround Dynamic Cache guarde respuestas de la API
header('Cache-Control: no-store, no-cache, must-revalidate');
header('Pragma: no-cache');
