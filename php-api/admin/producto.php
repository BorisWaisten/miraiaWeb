<?php
/**
 * GET    /api/admin/producto.php?id=12  → detalle (incluye inactivos), para el form de edición
 * POST   /api/admin/producto.php?id=12  → actualizar (multipart/form-data, mismos campos que crear)
 * DELETE /api/admin/producto.php?id=12  → eliminar producto + su imagen en disco
 *
 * Nota: la actualización usa POST (no PUT) a propósito — PHP no parsea
 * multipart/form-data en requests PUT de forma nativa, y mezclar dos formas
 * de parseo distintas no aporta nada acá. El propio query param ?id= ya
 * distingue "crear" (admin/productos.php, sin id) de "actualizar" (este archivo, con id).
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

    $nuevaImagen = null;
    if (!empty($_FILES['imagen']) && ($_FILES['imagen']['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_NO_FILE) {
        $nuevaImagen = Upload::guardarImagenProducto($_FILES['imagen']);
        // La imagen vieja se borra del disco recién después de guardar la nueva con éxito.
        Upload::borrarImagenProducto($existente['imagenPrincipal']);
    }

    $actualizado = Productos::actualizar($id, $datos, $nuevaImagen);
    Response::ok($actualizado);
}

if ($metodo === 'DELETE') {
    $eliminado = Productos::eliminar($id);
    if (!$eliminado) {
        Response::error('Producto no encontrado.', 404);
    }
    Upload::borrarImagenProducto($eliminado['imagenPrincipal']);
    Response::ok($eliminado);
}

Response::error('Método no permitido.', 405);
