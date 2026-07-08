<?php
defined('MIRAIA_API_BOOT') or die('Acceso directo no permitido.');

require_once __DIR__ . '/Response.php';

/**
 * Validación de entrada para crear/actualizar productos.
 * Desde la migración 003 un producto solo tiene nombre, imágenes y flags.
 */
final class Validacion
{
    public static function datosProducto(array $input, bool $esCreacion): array
    {
        $datos = [];

        // nombre
        $nombre = trim($input['nombre'] ?? '');
        if ($esCreacion || $nombre !== '') {
            if (mb_strlen($nombre) < 2 || mb_strlen($nombre) > 160) {
                Response::error('El nombre es obligatorio (2 a 160 caracteres).', 400);
            }
            $datos['nombre'] = $nombre;
        }

        // Textos opcionales — vacío se guarda como NULL
        foreach (['subtitulo' => 160, 'descripcionCorta' => 280, 'descripcionLarga' => 20000] as $campo => $max) {
            if (array_key_exists($campo, $input)) {
                $valor = trim((string) $input[$campo]);
                if (mb_strlen($valor) > $max) {
                    Response::error("El campo \"{$campo}\" no puede superar los {$max} caracteres.", 400);
                }
                $datos[$campo] = $valor !== '' ? $valor : null;
            }
        }

        if (isset($input['destacado'])) {
            $datos['destacado'] = in_array($input['destacado'], ['1', 'true', 'on', 1, true], true);
        }
        if (isset($input['activo'])) {
            $datos['activo'] = in_array($input['activo'], ['1', 'true', 'on', 1, true], true);
        }
        if (isset($input['orden'])) {
            $datos['orden'] = max(0, (int) $input['orden']);
        }

        return $datos;
    }

    public static function credencialesLogin(array $input): array
    {
        $email    = trim($input['email'] ?? '');
        $password = (string) ($input['password'] ?? '');

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            Response::error('Email inválido.', 400);
        }
        if (mb_strlen($password) < 6) {
            Response::error('La contraseña debe tener al menos 6 caracteres.', 400);
        }

        return ['email' => $email, 'password' => $password];
    }
}
