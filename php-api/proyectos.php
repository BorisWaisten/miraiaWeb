<?php
/**
 * GET /api/proyectos.php
 * Listado público de proyectos realizados (sección home, layout 2:1 en marfil).
 */
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/lib/Response.php';
require_once __DIR__ . '/lib/Proyectos.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'GET') {
    Response::error('Método no permitido.', 405);
}

Response::ok(Proyectos::listarActivos());
