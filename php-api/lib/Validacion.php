<?php
defined('MIRAIA_API_BOOT') or die('Acceso directo no permitido.');

require_once __DIR__ . '/Response.php';
require_once __DIR__ . '/Categorias.php';

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

        // linea (migración 005) — define la URL pública del producto
        if (array_key_exists('linea', $input)) {
            if (!in_array($input['linea'], ['alfombra-modular', 'piso-tecnico'], true)) {
                Response::error('Línea inválida.', 400);
            }
            $datos['linea'] = $input['linea'];
        }

        // categoriaId (migración 007) — opcional; vacío = sin categoría
        if (array_key_exists('categoriaId', $input)) {
            $valor = trim((string) $input['categoriaId']);
            if ($valor === '') {
                $datos['categoriaId'] = null;
            } else {
                $categoriaId = (int) $valor;
                if ($categoriaId <= 0 || !Categorias::obtenerPorId($categoriaId)) {
                    Response::error('La categoría seleccionada no existe.', 400);
                }
                $datos['categoriaId'] = $categoriaId;
            }
        }

        // Textos opcionales — vacío se guarda como NULL
        foreach (['subtitulo' => 160, 'descripcionCorta' => 280, 'descripcionLarga' => 20000, 'especificaciones' => 5000] as $campo => $max) {
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

    public static function datosCategoria(array $input): array
    {
        $nombre = trim($input['nombre'] ?? '');
        if (mb_strlen($nombre) < 2 || mb_strlen($nombre) > 160) {
            Response::error('El nombre es obligatorio (2 a 160 caracteres).', 400);
        }
        return ['nombre' => $nombre];
    }

    public static function datosVariante(array $input): array
    {
        $nombre = trim($input['nombre'] ?? '');
        if (mb_strlen($nombre) < 1 || mb_strlen($nombre) > 160) {
            Response::error('El nombre de la variante es obligatorio (1 a 160 caracteres).', 400);
        }
        return ['nombre' => $nombre];
    }

    public static function datosBlogPost(array $input, bool $esCreacion): array
    {
        $datos = [];

        $titulo = trim($input['titulo'] ?? '');
        if ($esCreacion || $titulo !== '') {
            if (mb_strlen($titulo) < 4 || mb_strlen($titulo) > 220) {
                Response::error('El título es obligatorio (4 a 220 caracteres).', 400);
            }
            $datos['titulo'] = $titulo;
        }

        $contenido = trim($input['contenido'] ?? '');
        if ($esCreacion || array_key_exists('contenido', $input)) {
            if (mb_strlen($contenido) < 10) {
                Response::error('El contenido es obligatorio (mínimo 10 caracteres).', 400);
            }
            $datos['contenido'] = $contenido;
        }

        foreach (['categoria' => 120, 'resumen' => 400] as $campo => $max) {
            if (array_key_exists($campo, $input)) {
                $valor = trim((string) $input[$campo]);
                if (mb_strlen($valor) > $max) {
                    Response::error("El campo \"{$campo}\" no puede superar los {$max} caracteres.", 400);
                }
                $datos[$campo] = $valor !== '' ? $valor : null;
            }
        }

        if (array_key_exists('imagenPortada', $input)) {
            $valor = trim((string) $input['imagenPortada']);
            if (mb_strlen($valor) > 500) {
                Response::error('La URL de la imagen de portada es demasiado larga.', 400);
            }
            $datos['imagenPortada'] = $valor !== '' ? $valor : null;
        }

        if (isset($input['publicado'])) {
            $datos['publicado'] = in_array($input['publicado'], ['1', 'true', 'on', 1, true], true);
        }
        if (isset($input['destacado'])) {
            $datos['destacado'] = in_array($input['destacado'], ['1', 'true', 'on', 1, true], true);
        }
        if (isset($input['orden'])) {
            $datos['orden'] = max(0, (int) $input['orden']);
        }

        return $datos;
    }

    public static function datosSeccionNosotros(array $input, bool $esCreacion): array
    {
        $datos = [];

        $titulo = trim($input['titulo'] ?? '');
        if ($esCreacion || array_key_exists('titulo', $input)) {
            if (mb_strlen($titulo) < 2 || mb_strlen($titulo) > 220) {
                Response::error('El título es obligatorio (2 a 220 caracteres).', 400);
            }
            $datos['titulo'] = $titulo;
        }

        $body = trim($input['body'] ?? '');
        if ($esCreacion || array_key_exists('body', $input)) {
            if (mb_strlen($body) < 10) {
                Response::error('El cuerpo de la sección es obligatorio (mínimo 10 caracteres).', 400);
            }
            $datos['body'] = $body;
        }

        if (array_key_exists('subtitulo', $input)) {
            $valor = trim((string) $input['subtitulo']);
            if (mb_strlen($valor) > 280) {
                Response::error('El subtítulo no puede superar los 280 caracteres.', 400);
            }
            $datos['subtitulo'] = $valor !== '' ? $valor : null;
        }

        if (array_key_exists('imagenUrl', $input)) {
            $valor = trim((string) $input['imagenUrl']);
            if (mb_strlen($valor) > 500) {
                Response::error('La URL de la imagen es demasiado larga.', 400);
            }
            $datos['imagenUrl'] = $valor !== '' ? $valor : null;
        }

        if (isset($input['activo'])) {
            $datos['activo'] = in_array($input['activo'], ['1', 'true', 'on', 1, true], true);
        }
        if (isset($input['orden'])) {
            $datos['orden'] = max(0, (int) $input['orden']);
        }

        return $datos;
    }

    public static function datosProyecto(array $input, bool $esCreacion): array
    {
        $datos = [];

        $nombre = trim($input['nombre'] ?? '');
        if ($esCreacion || array_key_exists('nombre', $input)) {
            if (mb_strlen($nombre) < 2 || mb_strlen($nombre) > 160) {
                Response::error('El nombre (producto instalado) es obligatorio (2 a 160 caracteres).', 400);
            }
            $datos['nombre'] = $nombre;
        }

        $etiqueta = trim($input['etiqueta'] ?? '');
        if ($esCreacion || array_key_exists('etiqueta', $input)) {
            if (mb_strlen($etiqueta) < 2 || mb_strlen($etiqueta) > 160) {
                Response::error('La etiqueta (tipo de espacio y ubicación) es obligatoria (2 a 160 caracteres).', 400);
            }
            $datos['etiqueta'] = $etiqueta;
        }

        if (array_key_exists('cliente', $input)) {
            $valor = trim((string) $input['cliente']);
            if (mb_strlen($valor) > 160) {
                Response::error('El cliente no puede superar los 160 caracteres.', 400);
            }
            $datos['cliente'] = $valor !== '' ? $valor : null;
        }

        if (array_key_exists('imagen', $input)) {
            $valor = trim((string) $input['imagen']);
            if (mb_strlen($valor) > 500) {
                Response::error('La URL de la imagen es demasiado larga.', 400);
            }
            $datos['imagen'] = $valor !== '' ? $valor : null;
        }

        if (isset($input['esPrincipal'])) {
            $datos['esPrincipal'] = in_array($input['esPrincipal'], ['1', 'true', 'on', 1, true], true);
        }
        if (isset($input['activo'])) {
            $datos['activo'] = in_array($input['activo'], ['1', 'true', 'on', 1, true], true);
        }
        if (isset($input['orden'])) {
            $datos['orden'] = max(0, (int) $input['orden']);
        }

        return $datos;
    }
}
