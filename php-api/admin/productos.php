<?php
/**
 * GET  /api/admin/productos.php  → listado completo (incluye inactivos), protegido
 * POST /api/admin/productos.php  → crear producto
 *   multipart/form-data:
 *     nombre, catalogoId, descripcionCorta, descripcionLarga?,
 *     especificaciones? (JSON string), destacado?, activo?, orden?,
 *     imagen_1? (File — principal), imagen_2? (File), imagen_3? (File)
 */
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../lib/Response.php';
require_once __DIR__ . '/../lib/Auth.php';
require_once __DIR__ . '/../lib/Productos.php';
require_once __DIR__ . '/../lib/Validacion.php';
require_once __DIR__ . '/../lib/Upload.php';

Auth::requerirSesion();

$metodo = $_SERVER['REQUEST_METHOD'] ?? '';

if ($metodo === 'GET') {
    Response::ok(Productos::listar(soloActivos: false));
}

if ($metodo === 'POST') {
    $datos = Validacion::datosProducto($_POST, esCreacion: true);

    [$imagenPrincipal, $galeria] = Upload::procesarImagenesProducto($_FILES);

    $producto = Productos::crear($datos, $imagenPrincipal, $galeria);
    Response::ok($producto, 201);
}

Response::error('Método no permitido.', 405);
