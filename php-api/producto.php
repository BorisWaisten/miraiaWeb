<?php
/**
 * GET /api/producto.php?slug=serie-elevado
 * Detalle público de un producto activo (sin precio).
 */
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/lib/Response.php';
require_once __DIR__ . '/lib/Productos.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'GET') {
    Response::error('Método no permitido.', 405);
}

$slug = trim($_GET['slug'] ?? '');
if ($slug === '') {
    Response::error('Falta el parámetro "slug".', 400);
}

$producto = Productos::obtenerPorSlug($slug);

if (!$producto || !$producto['activo']) {
    Response::error('Producto no encontrado.', 404);
}

Response::ok($producto);
