<?php
defined('MIRAIA_API_BOOT') or die('Acceso directo no permitido.');

require_once __DIR__ . '/Response.php';
require_once __DIR__ . '/Productos.php';

/**
 * Validación de entrada para crear/actualizar productos. Equivalente PHP de
 * los esquemas zod del prototipo Next/Node. Corta con 400 ante el primer error.
 *
 * @param array $input    típicamente $_POST
 * @param bool  $esCreacion si es true, nombre/categoria/descripcionCorta son obligatorios;
 *                           si es false (edición), todos los campos son opcionales.
 */
final class Validacion
{
    public static function datosProducto(array $input, bool $esCreacion): array
    {
        $datos = [];

        $nombre = trim($input['nombre'] ?? '');
        if ($esCreacion || $nombre !== '') {
            if (mb_strlen($nombre) < 2 || mb_strlen($nombre) > 160) {
                Response::error('El nombre es obligatorio (2 a 160 caracteres).', 400);
            }
            $datos['nombre'] = $nombre;
        }

        $categoria = trim($input['categoria'] ?? '');
        if ($esCreacion || $categoria !== '') {
            if (!in_array($categoria, Productos::CATEGORIAS_VALIDAS, true)) {
                Response::error('Categoría inválida.', 400);
            }
            $datos['categoria'] = $categoria;
        }

        $descripcionCorta = trim($input['descripcionCorta'] ?? '');
        if ($esCreacion || $descripcionCorta !== '') {
            if (mb_strlen($descripcionCorta) < 10 || mb_strlen($descripcionCorta) > 280) {
                Response::error('La descripción corta es obligatoria (10 a 280 caracteres).', 400);
            }
            $datos['descripcionCorta'] = $descripcionCorta;
        }

        if (isset($input['descripcionLarga'])) {
            $datos['descripcionLarga'] = mb_substr(trim($input['descripcionLarga']), 0, 4000);
        }

        if (isset($input['especificaciones']) && $input['especificaciones'] !== '') {
            $decoded = json_decode($input['especificaciones'], true);
            if (!is_array($decoded)) {
                Response::error('El campo "especificaciones" debe ser JSON válido.', 400);
            }
            $datos['especificaciones'] = $decoded;
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
        $email = trim($input['email'] ?? '');
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
