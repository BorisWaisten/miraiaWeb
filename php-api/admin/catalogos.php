<?php
/**
 * GET  /api/admin/catalogos.php  → listado completo (con conteo de productos), protegido
 * POST /api/admin/catalogos.php  → crear catálogo
 *   application/json:  { nombre, descripcion?, activo?, orden? }
 */
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../lib/Response.php';
require_once __DIR__ . '/../lib/Auth.php';
require_once __DIR__ . '/../lib/Catalogos.php';

Auth::requerirSesion();

$metodo = $_SERVER['REQUEST_METHOD'] ?? '';

if ($metodo === 'GET') {
    Response::ok(Catalogos::listar(soloActivos: false));
}

if ($metodo === 'POST') {
    $body = json_decode(file_get_contents('php://input'), true) ?? [];

    $nombre = trim($body['nombre'] ?? '');
    if (mb_strlen($nombre) < 2 || mb_strlen($nombre) > 160) {
        Response::error('El nombre es obligatorio (2 a 160 caracteres).', 400);
    }

    $datos = [
        'nombre'      => $nombre,
        'descripcion' => isset($body['descripcion']) ? mb_substr(trim($body['descripcion']), 0, 500) : null,
        'activo'      => $body['activo'] ?? true,
        'orden'       => (int) ($body['orden'] ?? 0),
    ];

    if (!empty($body['slug'])) {
        $datos['slug'] = preg_replace('/[^a-z0-9_\-]/', '', strtolower(trim($body['slug'])));
    }

    $catalogo = Catalogos::crear($datos);
    Response::ok($catalogo, 201);
}

Response::error('Método no permitido.', 405);
