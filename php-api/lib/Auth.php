<?php
defined('MIRAIA_API_BOOT') or die('Acceso directo no permitido.');

require_once __DIR__ . '/Jwt.php';
require_once __DIR__ . '/Response.php';

/**
 * Sesión de administrador vía JWT en cookie httpOnly. Reemplaza al middleware
 * de Next.js: como ya no hay Node corriendo, esta verificación se hace acá,
 * al principio de cada endpoint mutante o de lectura privada.
 */
final class Auth
{
    private static function cookieName(): string
    {
        return env('AUTH_COOKIE_NAME', 'miraia_session');
    }

    private static function secret(): string
    {
        $secret = env('JWT_SECRET');
        if (!$secret || strlen($secret) < 16) {
            throw new RuntimeException('JWT_SECRET no configurado o demasiado corto.');
        }
        return $secret;
    }

    /** Firma el JWT y setea la cookie httpOnly de sesión. */
    public static function iniciarSesion(int $adminId, string $email, string $nombre): void
    {
        $expira = (int) env('JWT_EXPIRES_SECONDS', '28800'); // 8 horas
        $token = Jwt::encode(['sub' => (string) $adminId, 'email' => $email, 'nombre' => $nombre], self::secret(), $expira);

        setcookie(self::cookieName(), $token, [
            'expires' => time() + $expira,
            'path' => '/',
            'httponly' => true,
            'secure' => true, // el sitio corre sobre HTTPS (sg-host.com y dominio final)
            'samesite' => 'Lax',
        ]);
    }

    public static function cerrarSesion(): void
    {
        setcookie(self::cookieName(), '', [
            'expires' => time() - 3600,
            'path' => '/',
            'httponly' => true,
            'secure' => true,
            'samesite' => 'Lax',
        ]);
    }

    /** Devuelve el payload de la sesión actual, o `null` si no hay sesión válida. */
    public static function adminActual(): ?array
    {
        $token = $_COOKIE[self::cookieName()] ?? null;
        if (!$token) {
            return null;
        }
        return Jwt::decode($token, self::secret());
    }

    /** Corta la ejecución con 401 si no hay sesión válida. Usar al inicio de endpoints protegidos. */
    public static function requerirSesion(): array
    {
        $admin = self::adminActual();
        if ($admin === null) {
            Response::error('No autorizado. Iniciá sesión nuevamente.', 401);
        }
        return $admin;
    }
}
