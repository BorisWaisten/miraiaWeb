<?php
/**
 * POST /api/contacto.php
 * Endpoint PÚBLICO — formulario comercial. Envía la consulta por mail
 * (mail() nativo de SiteGround, sin dependencias). No usa base de datos.
 */
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/lib/Response.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    Response::error('Método no permitido.', 405);
}

$input   = json_decode(file_get_contents('php://input'), true) ?? [];
$nombre  = trim(str_replace(["\r", "\n"], ' ', (string) ($input['nombre'] ?? '')));
$empresa = trim(str_replace(["\r", "\n"], ' ', (string) ($input['empresa'] ?? '')));
$email   = trim((string) ($input['email'] ?? ''));
$mensaje = trim((string) ($input['mensaje'] ?? ''));

if (mb_strlen($nombre) < 2 || mb_strlen($nombre) > 160) {
    Response::error('El nombre es obligatorio (2 a 160 caracteres).', 400);
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    Response::error('Email inválido.', 400);
}
if ($mensaje === '' || mb_strlen($mensaje) > 5000) {
    Response::error('El mensaje es obligatorio (hasta 5000 caracteres).', 400);
}

$para   = env('CONTACT_EMAIL', 'info@miraia.com.ar');
$asunto = 'Consulta web MIRAIA — ' . $nombre;
$cuerpo = "Nombre: {$nombre}\n"
        . ($empresa !== '' ? "Empresa: {$empresa}\n" : '')
        . "Email: {$email}\n\n{$mensaje}";
$headers = 'From: ' . env('MAIL_FROM', 'no-reply@miraia.com.ar') . "\r\nReply-To: {$email}";

if (!mail($para, $asunto, $cuerpo, $headers)) {
    Response::error('No se pudo enviar el mensaje.', 500);
}

Response::ok(true);
