<?php
defined('MIRAIA_API_BOOT') or die('Acceso directo no permitido.');

/** Helpers de respuesta JSON consistentes para todos los endpoints. */
final class Response
{
    public static function json(array $data, int $status = 200): never
    {
        http_response_code($status);
        echo json_encode($data, JSON_UNESCAPED_UNICODE);
        exit;
    }

    public static function ok(mixed $data, int $status = 200): never
    {
        self::json(['data' => $data], $status);
    }

    public static function error(string $mensaje, int $status = 400): never
    {
        self::json(['error' => $mensaje], $status);
    }
}
