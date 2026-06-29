<?php
/**
 * GET    /api/admin/catalogo.php?id=1  → detalle
 * POST   /api/admin/catalogo.php?id=1  → actualizar (application/json)
 * DELETE /api/admin/catalogo.php?id=1  → eliminar (solo si sin productos)
 */
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../lib/Response.php';
require_once __DIR__ . '/../lib/Auth.php';
require_once __DIR__ . '/../lib/Catalogos.php';

Auth::requerirSesion();

$id = (int) ($_GET['id'] ?? 0);
if ($id <= 0) {
    Response::error('Falta o es inválido el parámetro "id".', 400);
}

$metodo = $_SERVER['REQUEST_METHOD'] ?? '';

if ($metodo === 'GET') {
    $catalogo = Catalogos::obtenerPorId($id);
    if (!$catalogo) {
        Response::error('Catálogo no encontrado.', 404);
    }
    Response::ok($catalogo);
}

if ($metodo === 'POST') {
    $body = json_decode(file_get_contents('php://input'), true) ?? [];

    $datos = [];

    if (isset($body['nombre'])) {
        $nombre = trim($body['nombre']);
        if (mb_strlen($nombre) < 2 || mb_strlen($nombre) > 160) {
            Response::error('El nombre debe tener entre 2 y 160 caracteres.', 400);
        }
        $datos['nombre'] = $nombre;
    }

    if (array_key_exists('descripcion', $body)) {
        $datos['descripcion'] = $body['descripcion'] !== null
            ? mb_substr(trim($body['descripcion']), 0, 500)
            : null;
    }

    if (isset($body['activo'])) {
        $datos['activo'] = (bool) $body['activo'];
    }

    if (isset($body['orden'])) {
        $datos['orden'] = max(0, (int) $body['orden']);
    }

    if (!empty($body['slug'])) {
        $datos['slug'] = preg_replace('/[^a-z0-9_\-]/', '', strtolower(trim($body['slug'])));
    }

    $actualizado = Catalogos::actualizar($id, $datos);
    if (!$actualizado) {
        Response::error('Catálogo no encontrado.', 404);
    }
    Response::ok($actualizado);
}

if ($metodo === 'DELETE') {
    $resultado = Catalogos::eliminar($id);
    if ($resultado === null) {
        Response::error('Catálogo no encontrado.', 404);
    }
    if (isset($resultado['error_productos'])) {
        Response::error(
            "No se puede eliminar: hay {$resultado['error_productos']} producto(s) usando este catálogo.",
            409
        );
    }
    Response::ok($resultado);
}

Response::error('Método no permitido.', 405);
