<?php
/**
 * GET    /api/admin/nosotros-seccion.php?id=5  → detalle, para el form de edición
 * POST   /api/admin/nosotros-seccion.php?id=5  → actualizar — JSON, mismos campos que crear
 * DELETE /api/admin/nosotros-seccion.php?id=5  → eliminar
 */
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../lib/Response.php';
require_once __DIR__ . '/../lib/Auth.php';
require_once __DIR__ . '/../lib/NosotrosSecciones.php';
require_once __DIR__ . '/../lib/Validacion.php';

Auth::requerirSesion();

$id = (int) ($_GET['id'] ?? 0);
if ($id <= 0) {
    Response::error('Falta o es inválido el parámetro "id".', 400);
}

$metodo = $_SERVER['REQUEST_METHOD'] ?? '';

if ($metodo === 'GET') {
    $seccion = NosotrosSecciones::obtenerPorId($id);
    if (!$seccion) {
        Response::error('Sección no encontrada.', 404);
    }
    Response::ok($seccion);
}

if ($metodo === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
    $datos = Validacion::datosSeccionNosotros($input, esCreacion: false);

    $actualizada = NosotrosSecciones::actualizar($id, $datos);
    if (!$actualizada) {
        Response::error('Sección no encontrada.', 404);
    }
    Response::ok($actualizada);
}

if ($metodo === 'DELETE') {
    $eliminada = NosotrosSecciones::eliminar($id);
    if (!$eliminada) {
        Response::error('Sección no encontrada.', 404);
    }
    Response::ok($eliminada);
}

Response::error('Método no permitido.', 405);
