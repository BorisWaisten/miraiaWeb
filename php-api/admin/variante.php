<?php
/**
 * GET    /api/admin/variante.php?id=5  → detalle
 * POST   /api/admin/variante.php?id=5  → actualizar — JSON o form: { nombre }
 * DELETE /api/admin/variante.php?id=5  → eliminar
 */
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../lib/Response.php';
require_once __DIR__ . '/../lib/Auth.php';
require_once __DIR__ . '/../lib/Variantes.php';
require_once __DIR__ . '/../lib/Validacion.php';

Auth::requerirSesion();

$id = (int) ($_GET['id'] ?? 0);
if ($id <= 0) {
    Response::error('Falta o es inválido el parámetro "id".', 400);
}

$metodo = $_SERVER['REQUEST_METHOD'] ?? '';

if ($metodo === 'GET') {
    $variante = Variantes::obtenerPorId($id);
    if (!$variante) {
        Response::error('Variante no encontrada.', 404);
    }
    Response::ok($variante);
}

if ($metodo === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
    $datos = Validacion::datosVariante($input);

    $actualizada = Variantes::actualizar($id, $datos['nombre']);
    if (!$actualizada) {
        Response::error('Variante no encontrada.', 404);
    }
    Response::ok($actualizada);
}

if ($metodo === 'DELETE') {
    $eliminada = Variantes::eliminar($id);
    if (!$eliminada) {
        Response::error('Variante no encontrada.', 404);
    }
    Response::ok($eliminada);
}

Response::error('Método no permitido.', 405);
