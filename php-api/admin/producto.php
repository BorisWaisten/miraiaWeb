<?php
/**
 * GET    /api/admin/producto.php?id=12  → detalle (incluye inactivos), para el form de edición
 * POST   /api/admin/producto.php?id=12  → actualizar
 *   multipart/form-data — mismos campos que crear, más flags de borrado:
 *     borrar_imagen_1=1, borrar_imagen_2=1, borrar_imagen_3=1
 * DELETE /api/admin/producto.php?id=12  → eliminar producto + todas sus imágenes en disco
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

    $borrar = [
        'imagen_1' => !empty($_POST['borrar_imagen_1']),
        'imagen_2' => !empty($_POST['borrar_imagen_2']),
        'imagen_3' => !empty($_POST['borrar_imagen_3']),
    ];

    [$nuevaImagen1, $nuevaGaleria] = Upload::procesarImagenesProducto($_FILES, $existente, $borrar);

    // Upload::procesarImagenesProducto ya borró del disco las imágenes que debía.
    // El flag $borrarImagenPrincipal le dice a Productos::actualizar que ponga NULL
    // cuando no viene nueva imagen_1 pero sí se pidió borrar la existente.
    $borrarPrincipal = $borrar['imagen_1'] && $nuevaImagen1 === null;

    $actualizado = Productos::actualizar($id, $datos, $nuevaImagen1, $nuevaGaleria, $borrarPrincipal);
    Response::ok($actualizado);
}

if ($metodo === 'DELETE') {
    $eliminado = Productos::eliminar($id);
    if (!$eliminado) {
        Response::error('Producto no encontrado.', 404);
    }
    Upload::borrarTodasLasImagenes($eliminado);
    Response::ok($eliminado);
}

Response::error('Método no permitido.', 405);
