<?php
/**
 * GET    /api/admin/categoria.php?id=3  → detalle
 * POST   /api/admin/categoria.php?id=3  → actualizar — JSON o form: { nombre }
 * DELETE /api/admin/categoria.php?id=3  → eliminar (productos que la usaban quedan sin categoría)
 */
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../lib/Response.php';
require_once __DIR__ . '/../lib/Auth.php';
require_once __DIR__ . '/../lib/Categorias.php';
require_once __DIR__ . '/../lib/Validacion.php';

Auth::requerirSesion();

$id = (int) ($_GET['id'] ?? 0);
if ($id <= 0) {
    Response::error('Falta o es inválido el parámetro "id".', 400);
}

$metodo = $_SERVER['REQUEST_METHOD'] ?? '';

if ($metodo === 'GET') {
    $categoria = Categorias::obtenerPorId($id);
    if (!$categoria) {
        Response::error('Categoría no encontrada.', 404);
    }
    Response::ok($categoria);
}

if ($metodo === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
    $datos = Validacion::datosCategoria($input);

    $actualizada = Categorias::actualizar($id, $datos['nombre']);
    if (!$actualizada) {
        Response::error('Categoría no encontrada.', 404);
    }
    Response::ok($actualizada);
}

if ($metodo === 'DELETE') {
    $eliminada = Categorias::eliminar($id);
    if (!$eliminada) {
        Response::error('Categoría no encontrada.', 404);
    }
    Response::ok($eliminada);
}

Response::error('Método no permitido.', 405);
