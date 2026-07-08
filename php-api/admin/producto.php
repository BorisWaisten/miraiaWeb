<?php
/**
 * GET    /api/admin/producto.php?id=12  → detalle (incluye inactivos), para el form de edición
 * POST   /api/admin/producto.php?id=12  → actualizar
 *   multipart/form-data — mismos campos que crear, más:
 *     borrar_imagen_1=1                → limpiar imagen principal
 *     galeria_conservar (JSON array)   → rutas existentes que se mantienen;
 *                                        si no se envía, la galería no se toca.
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

    $borrarPrincipal = !empty($_POST['borrar_imagen_1']);

    $galeriaConservar = null;
    if (isset($_POST['galeria_conservar'])) {
        $decoded = json_decode($_POST['galeria_conservar'], true);
        $galeriaConservar = is_array($decoded) ? $decoded : [];
    }

    [$nuevaImagen1, $nuevaGaleria] = Upload::procesarImagenesProducto(
        $_FILES,
        $existente,
        $borrarPrincipal,
        $galeriaConservar
    );

    // Upload ya borró del disco lo que debía. $borrarPrincipal le dice a
    // Productos::actualizar que ponga NULL si no vino imagen_1 nueva.
    $borrarPrincipal = $borrarPrincipal && $nuevaImagen1 === null;

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
