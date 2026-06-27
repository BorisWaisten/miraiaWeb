<?php
/**
 * GET /api/admin/me.php
 * Devuelve el admin de la sesión actual, o 401 si no hay sesión válida.
 * El panel admin (estático) usa esto al cargar cualquier página de /admin
 * para decidir si redirige a /admin/login — reemplaza al guard que antes
 * hacía el middleware de Next.js a nivel de servidor.
 */
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../lib/Response.php';
require_once __DIR__ . '/../lib/Auth.php';

$admin = Auth::requerirSesion();

Response::ok([
    'id' => (int) $admin['sub'],
    'email' => $admin['email'],
    'nombre' => $admin['nombre'],
]);
