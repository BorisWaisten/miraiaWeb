<?php
/** POST /api/admin/logout.php — invalida la sesión borrando la cookie httpOnly. */
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../lib/Response.php';
require_once __DIR__ . '/../lib/Auth.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    Response::error('Método no permitido.', 405);
}

Auth::cerrarSesion();
Response::ok(['ok' => true]);
