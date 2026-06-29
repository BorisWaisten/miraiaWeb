<?php
/**
 * GET /api/productos.php
 * Endpoint PÚBLICO de solo lectura — catálogo de exhibición (sin precios).
 * Soporta filtro opcional ?catalogo=<slug> para filtrar por catálogo.
 * No requiere autenticación.
 */
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/lib/Response.php';
require_once __DIR__ . '/lib/Productos.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'GET') {
    Response::error('Método no permitido.', 405);
}

$catalogoSlug = $_GET['catalogo'] ?? null;

if ($catalogoSlug !== null) {
    $productos = Productos::listarPorCatalogo($catalogoSlug, soloActivos: true);
} else {
    $productos = Productos::listar(soloActivos: true);
}

Response::ok($productos);
