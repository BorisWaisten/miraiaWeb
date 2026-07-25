<?php
/**
 * GET /api/variante-imagenes.php?categoria=<slug>&variante=<slug>
 * Endpoint PÚBLICO de solo lectura — imágenes de una variante de producto,
 * resueltas en runtime contra Cloudinary (migración 007). No requiere
 * autenticación.
 */
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/lib/Response.php';
require_once __DIR__ . '/lib/Cloudinary.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'GET') {
    Response::error('Método no permitido.', 405);
}

$categoria = trim($_GET['categoria'] ?? '');
$variante  = trim($_GET['variante'] ?? '');

if (!preg_match('/^[a-z0-9\-]+$/', $categoria) || !preg_match('/^[a-z0-9\-]+$/', $variante)) {
    Response::error('Parámetros "categoria" y "variante" inválidos.', 400);
}

try {
    $imagenes = Cloudinary::listarImagenesPorPrefijo($categoria, $variante);
} catch (Throwable $e) {
    error_log('[MIRAIA API] Cloudinary: ' . $e->getMessage());
    Response::error('No se pudieron cargar las imágenes de la variante.', 502);
}

Response::ok($imagenes);
