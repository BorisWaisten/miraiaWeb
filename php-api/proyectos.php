<?php
/**
 * GET /api/proyectos.php[?limite=N]
 * Listado público de proyectos realizados. Sin `limite`, devuelve 3 (teaser
 * de la sección home, layout 2:1 en negro); /proyectos/ pide un límite alto
 * para traer el listado completo.
 */
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/lib/Response.php';
require_once __DIR__ . '/lib/Proyectos.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'GET') {
    Response::error('Método no permitido.', 405);
}

$limite = isset($_GET['limite']) ? max(1, min(200, (int) $_GET['limite'])) : 3;

Response::ok(Proyectos::listarActivos($limite));
