<?php
/**
 * GET /api/productos.php
 * Endpoint PÚBLICO de solo lectura — catálogo de exhibición (sin precios).
 * Soporta filtro opcional ?categoria=piso_tecnico|alfombra_modular|vinilico_lvt
 * No requiere autenticación.
 */
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/lib/Response.php';
require_once __DIR__ . '/lib/Productos.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'GET') {
    Response::error('Método no permitido.', 405);
}

$categoria = $_GET['categoria'] ?? null;
if ($categoria !== null && !in_array($categoria, Productos::CATEGORIAS_VALIDAS, true)) {
    Response::error('Categoría inválida.', 400);
}

$productos = Productos::listar(soloActivos: true);

if ($categoria !== null) {
    $productos = array_values(array_filter($productos, static fn($p) => $p['categoria'] === $categoria));
}

Response::ok($productos);
