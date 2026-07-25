<?php
/**
 * GET    /api/admin/blog-post.php?id=5  → detalle (incluye no publicados), para el form de edición
 * POST   /api/admin/blog-post.php?id=5  → actualizar — JSON, mismos campos que crear
 * DELETE /api/admin/blog-post.php?id=5  → eliminar
 */
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../lib/Response.php';
require_once __DIR__ . '/../lib/Auth.php';
require_once __DIR__ . '/../lib/BlogPosts.php';
require_once __DIR__ . '/../lib/Validacion.php';

Auth::requerirSesion();

$id = (int) ($_GET['id'] ?? 0);
if ($id <= 0) {
    Response::error('Falta o es inválido el parámetro "id".', 400);
}

$metodo = $_SERVER['REQUEST_METHOD'] ?? '';

if ($metodo === 'GET') {
    $post = BlogPosts::obtenerPorId($id);
    if (!$post) {
        Response::error('Posteo no encontrado.', 404);
    }
    Response::ok($post);
}

if ($metodo === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
    $datos = Validacion::datosBlogPost($input, esCreacion: false);

    $actualizado = BlogPosts::actualizar($id, $datos);
    if (!$actualizado) {
        Response::error('Posteo no encontrado.', 404);
    }
    Response::ok($actualizado);
}

if ($metodo === 'DELETE') {
    $eliminado = BlogPosts::eliminar($id);
    if (!$eliminado) {
        Response::error('Posteo no encontrado.', 404);
    }
    Response::ok($eliminado);
}

Response::error('Método no permitido.', 405);
