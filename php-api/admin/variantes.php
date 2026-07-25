<?php
/**
 * GET  /api/admin/variantes.php?producto_id=12  → variantes de un producto
 * POST /api/admin/variantes.php                 → crear variante
 *   JSON o form: { productoId, nombre }
 */
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../lib/Response.php';
require_once __DIR__ . '/../lib/Auth.php';
require_once __DIR__ . '/../lib/Variantes.php';
require_once __DIR__ . '/../lib/Productos.php';
require_once __DIR__ . '/../lib/Validacion.php';

Auth::requerirSesion();

$metodo = $_SERVER['REQUEST_METHOD'] ?? '';

if ($metodo === 'GET') {
    $productoId = (int) ($_GET['producto_id'] ?? 0);
    if ($productoId <= 0) {
        Response::error('Falta o es inválido el parámetro "producto_id".', 400);
    }
    Response::ok(Variantes::listarPorProducto($productoId));
}

if ($metodo === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;

    $productoId = (int) ($input['productoId'] ?? 0);
    if ($productoId <= 0 || !Productos::obtenerPorId($productoId)) {
        Response::error('El producto indicado no existe.', 400);
    }

    $datos    = Validacion::datosVariante($input);
    $variante = Variantes::crear($productoId, $datos['nombre']);
    Response::ok($variante, 201);
}

Response::error('Método no permitido.', 405);
