<?php
/**
 * GET /api/productos.php
 * Endpoint PÚBLICO de solo lectura — productos de exhibición (sin precios).
 * No requiere autenticación.
 */
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/lib/Response.php';
require_once __DIR__ . '/lib/Productos.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'GET') {
    Response::error('Método no permitido.', 405);
}

Response::ok(Productos::listar(soloActivos: true));
