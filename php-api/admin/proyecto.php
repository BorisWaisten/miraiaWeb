<?php
/**
 * GET    /api/admin/proyecto.php?id=5  → detalle, para el form de edición
 * POST   /api/admin/proyecto.php?id=5  → actualizar — JSON, mismos campos que crear
 * DELETE /api/admin/proyecto.php?id=5  → eliminar
 */
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../lib/Response.php';
require_once __DIR__ . '/../lib/Auth.php';
require_once __DIR__ . '/../lib/Proyectos.php';
require_once __DIR__ . '/../lib/Validacion.php';

Auth::requerirSesion();

$id = (int) ($_GET['id'] ?? 0);
if ($id <= 0) {
    Response::error('Falta o es inválido el parámetro "id".', 400);
}

$metodo = $_SERVER['REQUEST_METHOD'] ?? '';

if ($metodo === 'GET') {
    $proyecto = Proyectos::obtenerPorId($id);
    if (!$proyecto) {
        Response::error('Proyecto no encontrado.', 404);
    }
    Response::ok($proyecto);
}

if ($metodo === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
    $datos = Validacion::datosProyecto($input, esCreacion: false);

    $actualizado = Proyectos::actualizar($id, $datos);
    if (!$actualizado) {
        Response::error('Proyecto no encontrado.', 404);
    }
    Response::ok($actualizado);
}

if ($metodo === 'DELETE') {
    $eliminado = Proyectos::eliminar($id);
    if (!$eliminado) {
        Response::error('Proyecto no encontrado.', 404);
    }
    Response::ok($eliminado);
}

Response::error('Método no permitido.', 405);
