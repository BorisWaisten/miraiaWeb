<?php
/**
 * GET  /api/admin/nosotros-secciones.php  → listado completo (incluye inactivas), protegido
 * POST /api/admin/nosotros-secciones.php  → crear sección
 *   JSON: titulo, subtitulo?, body, imagenUrl?, activo?, orden?
 */
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../lib/Response.php';
require_once __DIR__ . '/../lib/Auth.php';
require_once __DIR__ . '/../lib/NosotrosSecciones.php';
require_once __DIR__ . '/../lib/Validacion.php';

Auth::requerirSesion();

$metodo = $_SERVER['REQUEST_METHOD'] ?? '';

if ($metodo === 'GET') {
    Response::ok(NosotrosSecciones::listar(soloActivas: false));
}

if ($metodo === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
    $datos = Validacion::datosSeccionNosotros($input, esCreacion: true);

    $seccion = NosotrosSecciones::crear($datos);
    Response::ok($seccion, 201);
}

Response::error('Método no permitido.', 405);
