<?php
/**
 * GET /api/nosotros.php
 * Endpoint PÚBLICO de solo lectura — secciones activas de la página /nosotros/.
 * No requiere autenticación.
 */
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/lib/Response.php';
require_once __DIR__ . '/lib/NosotrosSecciones.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'GET') {
    Response::error('Método no permitido.', 405);
}

Response::ok(NosotrosSecciones::listar(soloActivas: true));
