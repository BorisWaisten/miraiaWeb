<?php
/**
 * GET /api/blog.php
 * Endpoint PÚBLICO de solo lectura — posteos de blog publicados.
 * No requiere autenticación.
 */
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/lib/Response.php';
require_once __DIR__ . '/lib/BlogPosts.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'GET') {
    Response::error('Método no permitido.', 405);
}

Response::ok(BlogPosts::listar(soloPublicados: true));
