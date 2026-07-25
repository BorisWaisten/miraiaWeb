<?php
/**
 * GET  /api/admin/blog-posts.php  → listado completo (incluye no publicados), protegido
 * POST /api/admin/blog-posts.php  → crear posteo
 *   JSON: titulo, categoria?, resumen?, contenido, imagenPortada?, publicado?, destacado?, orden?
 */
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../lib/Response.php';
require_once __DIR__ . '/../lib/Auth.php';
require_once __DIR__ . '/../lib/BlogPosts.php';
require_once __DIR__ . '/../lib/Validacion.php';

Auth::requerirSesion();

$metodo = $_SERVER['REQUEST_METHOD'] ?? '';

if ($metodo === 'GET') {
    Response::ok(BlogPosts::listar(soloPublicados: false));
}

if ($metodo === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
    $datos = Validacion::datosBlogPost($input, esCreacion: true);

    $post = BlogPosts::crear($datos);
    Response::ok($post, 201);
}

Response::error('Método no permitido.', 405);
