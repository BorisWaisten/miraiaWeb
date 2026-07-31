<?php
/**
 * GET  /api/admin/proyectos.php  → listado completo (incluye inactivos), protegido
 * POST /api/admin/proyectos.php  → crear proyecto
 *   JSON: nombre, etiqueta, cliente?, imagen?, esPrincipal?, activo?, orden?
 */
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../lib/Response.php';
require_once __DIR__ . '/../lib/Auth.php';
require_once __DIR__ . '/../lib/Proyectos.php';
require_once __DIR__ . '/../lib/Validacion.php';

Auth::requerirSesion();

$metodo = $_SERVER['REQUEST_METHOD'] ?? '';

if ($metodo === 'GET') {
    Response::ok(Proyectos::listar(soloActivos: false));
}

if ($metodo === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
    $datos = Validacion::datosProyecto($input, esCreacion: true);

    $proyecto = Proyectos::crear($datos);
    Response::ok($proyecto, 201);
}

Response::error('Método no permitido.', 405);
