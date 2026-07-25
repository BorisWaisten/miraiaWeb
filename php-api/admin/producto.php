<?php
/**
 * GET    /api/admin/producto.php?id=12  → detalle (incluye inactivos), para el form de edición
 * POST   /api/admin/producto.php?id=12  → actualizar (multipart/form-data, mismos campos que crear)
 * DELETE /api/admin/producto.php?id=12  → eliminar producto + certificados en disco
 *   (las variantes se borran en cascada por FK; ninguna imagen vive en este
 *   servidor desde la migración 008 — todas están en Cloudinary)
 */
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../lib/Response.php';
require_once __DIR__ . '/../lib/Auth.php';
require_once __DIR__ . '/../lib/Productos.php';
require_once __DIR__ . '/../lib/Validacion.php';
require_once __DIR__ . '/../lib/Upload.php';

Auth::requerirSesion();

$id = (int) ($_GET['id'] ?? 0);
if ($id <= 0) {
    Response::error('Falta o es inválido el parámetro "id".', 400);
}

$metodo = $_SERVER['REQUEST_METHOD'] ?? '';

if ($metodo === 'GET') {
    $producto = Productos::obtenerPorId($id);
    if (!$producto) {
        Response::error('Producto no encontrado.', 404);
    }
    Response::ok($producto);
}

if ($metodo === 'POST') {
    $existente = Productos::obtenerPorId($id);
    if (!$existente) {
        Response::error('Producto no encontrado.', 404);
    }

    $datos = Validacion::datosProducto($_POST, esCreacion: false);

    $certificadosConservar = null;
    if (isset($_POST['certificados_conservar'])) {
        $decoded = json_decode($_POST['certificados_conservar'], true);
        $certificadosConservar = is_array($decoded) ? $decoded : [];
    }
    $certificados = Upload::procesarCertificados($_FILES, $existente, $certificadosConservar);

    $actualizado = Productos::actualizar($id, $datos, $certificados);
    Response::ok($actualizado);
}

if ($metodo === 'DELETE') {
    $eliminado = Productos::eliminar($id);
    if (!$eliminado) {
        Response::error('Producto no encontrado.', 404);
    }
    Upload::borrarCertificados($eliminado);
    Response::ok($eliminado);
}

Response::error('Método no permitido.', 405);
