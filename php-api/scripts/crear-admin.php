<?php
/**
 * Bootstrap del primer usuario administrador.
 *
 * Uso por SSH (si tu plan de SiteGround lo incluye):
 *   php crear-admin.php admin@miraia.com.ar "contraseñaSegura123"
 *
 * Uso por navegador (si no tenés SSH — solo HTTP/FTP):
 *   https://tu-dominio/api/scripts/crear-admin.php?token=TOKEN&email=admin@miraia.com.ar&password=contraseñaSegura123
 *   El TOKEN tiene que matchear ADMIN_BOOTSTRAP_TOKEN en php-api/.env.
 *
 * IMPORTANTE: borrá este archivo (o al menos ADMIN_BOOTSTRAP_TOKEN de .env)
 * apenas crees el primer admin — si queda accesible, cualquiera con el token
 * podría crear cuentas de administrador.
 */
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../lib/Database.php';

function crearAdmin(string $email, string $password): void
{
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new InvalidArgumentException('Email inválido.');
    }
    if (strlen($password) < 8) {
        throw new InvalidArgumentException('La contraseña debe tener al menos 8 caracteres.');
    }

    $db = Database::get();

    $stmt = $db->prepare('SELECT id FROM admins WHERE email = ? LIMIT 1');
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        echo "El usuario admin {$email} ya existe — no se modifica.\n";
        return;
    }

    $hash = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
    $stmt = $db->prepare('INSERT INTO admins (email, password_hash, nombre) VALUES (?, ?, ?)');
    $stmt->execute([$email, $hash, 'Admin']);

    echo "Usuario admin creado: {$email}\n";
}

if (PHP_SAPI === 'cli') {
    [$script, $email, $password] = array_pad($argv, 3, null);
    if (!$email || !$password) {
        fwrite(STDERR, "Uso: php crear-admin.php <email> <password>\n");
        exit(1);
    }
    crearAdmin($email, $password);
    exit(0);
}

// Modo HTTP — gateado por token de un solo uso.
header('Content-Type: text/plain; charset=utf-8');

$tokenEsperado = env('ADMIN_BOOTSTRAP_TOKEN');
$tokenRecibido = $_GET['token'] ?? '';

if (!$tokenEsperado || !hash_equals($tokenEsperado, $tokenRecibido)) {
    http_response_code(403);
    echo "Token inválido o ADMIN_BOOTSTRAP_TOKEN no configurado en .env.\n";
    exit;
}

$email = $_GET['email'] ?? '';
$password = $_GET['password'] ?? '';

try {
    crearAdmin($email, $password);
    echo "\nListo. Por seguridad, borrá este archivo o quitá ADMIN_BOOTSTRAP_TOKEN de .env ahora.\n";
} catch (Throwable $e) {
    http_response_code(400);
    echo 'Error: ' . $e->getMessage() . "\n";
}
