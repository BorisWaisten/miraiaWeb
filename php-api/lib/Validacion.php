<?php
defined('MIRAIA_API_BOOT') or die('Acceso directo no permitido.');

require_once __DIR__ . '/Response.php';
require_once __DIR__ . '/Catalogos.php';

/**
 * Validación de entrada para crear/actualizar productos.
 * Desde la migración 001 usa `catalogoId` (FK dinámica) en lugar del ENUM `categoria`.
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

        // catalogoId (reemplaza el viejo campo `categoria` ENUM)
        $catalogoIdRaw = $input['catalogoId'] ?? '';
        if ($esCreacion || $catalogoIdRaw !== '') {
            $catalogoId = (int) $catalogoIdRaw;
            if ($catalogoId <= 0) {
                Response::error('El catálogo es obligatorio.', 400);
            }
            // Verificar que el catálogo exista y esté activo
            $catalogo = Catalogos::obtenerPorId($catalogoId);
            if (!$catalogo) {
                Response::error('El catálogo seleccionado no existe.', 400);
            }
            $datos['catalogoId'] = $catalogoId;
        }

        // descripcionCorta
        $descripcionCorta = trim($input['descripcionCorta'] ?? '');
        if ($esCreacion || $descripcionCorta !== '') {
            if (mb_strlen($descripcionCorta) < 10 || mb_strlen($descripcionCorta) > 280) {
                Response::error('La descripción corta es obligatoria (10 a 280 caracteres).', 400);
            }
            $datos['descripcionCorta'] = $descripcionCorta;
        }

        // descripcionLarga — se almacena como HTML limpio proveniente del editor Tiptap
        if (isset($input['descripcionLarga'])) {
            // strip_tags no alcanza para HTML de un editor rico; confiamos en que Tiptap
            // genera HTML semántico limpio. Se limita a 20 000 chars para prevenir abusos.
            $datos['descripcionLarga'] = mb_substr($input['descripcionLarga'], 0, 20000);
        }

        // especificaciones (JSON string opcional)
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
