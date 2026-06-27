<?php
/**
 * POST /api/admin/login.php
 * Body JSON: { "email": "...", "password": "..." }
 * Único endpoint de /api/admin/* que no requiere sesión previa (obviamente).
 */
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../lib/Response.php';
require_once __DIR__ . '/../lib/Database.php';
require_once __DIR__ . '/../lib/Auth.php';
require_once __DIR__ . '/../lib/Validacion.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    Response::error('Método no permitido.', 405);
}

$body = json_decode(file_get_contents('php://input'), true) ?: [];
['email' => $email, 'password' => $password] = Validacion::credencialesLogin($body);

$stmt = Database::get()->prepare('SELECT id, email, password_hash, nombre, activo FROM admins WHERE email = ? LIMIT 1');
$stmt->execute([$email]);
$admin = $stmt->fetch();

// Mismo mensaje de error para email inexistente o password incorrecta
// (evita filtrar si un email está registrado o no).
$credencialesInvalidas = static fn() => Response::error('Email o contraseña incorrectos.', 401);

if (!$admin || !$admin['activo']) {
    $credencialesInvalidas();
}

if (!password_verify($password, $admin['password_hash'])) {
    $credencialesInvalidas();
}

Auth::iniciarSesion((int) $admin['id'], $admin['email'], $admin['nombre']);

Response::ok(['admin' => ['id' => (int) $admin['id'], 'email' => $admin['email'], 'nombre' => $admin['nombre']]]);
