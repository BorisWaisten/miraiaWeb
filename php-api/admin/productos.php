<?php
/**
 * GET  /api/admin/productos.php           → listado completo (incluye inactivos), protegido
 * POST /api/admin/productos.php           → crear producto, protegido
 *   multipart/form-data:
 *     nombre, categoria, descripcionCorta, descripcionLarga?, especificaciones? (JSON string),
 *     destacado?, activo?, orden?, imagen? (File)
 *
 * No requiere campo `precio`: el catálogo es de exhibición/consulta, no de venta online.
 */
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../lib/Response.php';
require_once __DIR__ . '/../lib/Auth.php';
require_once __DIR__ . '/../lib/Productos.php';
require_once __DIR__ . '/../lib/Validacion.php';
require_once __DIR__ . '/../lib/Upload.php';

Auth::requerirSesion(); // protege tanto GET como POST de este endpoint

$metodo = $_SERVER['REQUEST_METHOD'] ?? '';

if ($metodo === 'GET') {
    Response::ok(Productos::listar(soloActivos: false));
}

if ($metodo === 'POST') {
    $datos = Validacion::datosProducto($_POST, esCreacion: true);
    $rutaImagen = Upload::guardarImagenProducto($_FILES['imagen'] ?? null);

    $producto = Productos::crear($datos, $rutaImagen);
    Response::ok($producto, 201);
}

Response::error('Método no permitido.', 405);
