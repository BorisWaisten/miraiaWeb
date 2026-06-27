<?php
defined('MIRAIA_API_BOOT') or die('Acceso directo no permitido.');

require_once __DIR__ . '/Database.php';

/** Acceso a datos de `proyectos` — sección "Proyectos realizados" del home. */
final class Proyectos
{
    public static function mapRow(array $fila): array
    {
        return [
            'id' => (int) $fila['id'],
            'slug' => $fila['slug'],
            'nombre' => $fila['nombre'],
            'etiqueta' => $fila['etiqueta'],
            'imagen' => $fila['imagen'],
            'esPrincipal' => (bool) $fila['destacado_principal'],
            'orden' => (int) $fila['orden'],
        ];
    }

    public static function listarActivos(int $limite = 3): array
    {
        $stmt = Database::get()->prepare(
            'SELECT id, slug, nombre, etiqueta, imagen, destacado_principal, orden
             FROM proyectos WHERE activo = 1 ORDER BY orden ASC LIMIT ?'
        );
        $stmt->bindValue(1, $limite, PDO::PARAM_INT);
        $stmt->execute();
        return array_map(self::mapRow(...), $stmt->fetchAll());
    }
}
