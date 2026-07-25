<?php
/**
 * GET  /api/admin/categorias.php  → listado completo, protegido
 * POST /api/admin/categorias.php  → crear categoría
 *   JSON o form: { nombre }
 */
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../lib/Response.php';
require_once __DIR__ . '/../lib/Auth.php';
require_once __DIR__ . '/../lib/Categorias.php';
require_once __DIR__ . '/../lib/Validacion.php';

Auth::requerirSesion();

$metodo = $_SERVER['REQUEST_METHOD'] ?? '';

if ($metodo === 'GET') {
    Response::ok(Categorias::listar());
}

if ($metodo === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
    $datos = Validacion::datosCategoria($input);

    $categoria = Categorias::crear($datos['nombre']);
    Response::ok($categoria, 201);
}

Response::error('Método no permitido.', 405);
