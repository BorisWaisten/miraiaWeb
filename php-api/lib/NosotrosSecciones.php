<?php
defined('MIRAIA_API_BOOT') or die('Acceso directo no permitido.');

require_once __DIR__ . '/Database.php';

/**
 * Capa de acceso a datos para `nosotros_secciones` (migración 011).
 * Cada sección es un bloque libre de la página /nosotros/: título, subtítulo
 * opcional, cuerpo de texto e imagen opcional. Sin slug — no tienen URL
 * propia, se listan todas en la misma página en el orden de `orden`.
 */
final class NosotrosSecciones
{
    public static function mapRow(array $fila): array
    {
        return [
            'id'        => (int) $fila['id'],
            'titulo'    => $fila['titulo'],
            'subtitulo' => $fila['subtitulo'],
            'body'      => $fila['body'],
            'imagenUrl' => $fila['imagen_url'],
            'activo'    => (bool) $fila['activo'],
            'orden'     => (int) $fila['orden'],
            'createdAt' => $fila['created_at'],
            'updatedAt' => $fila['updated_at'],
        ];
    }

    public static function listar(bool $soloActivas): array
    {
        $where = $soloActivas ? 'WHERE activo = 1' : '';
        $sql   = "SELECT * FROM nosotros_secciones {$where} ORDER BY orden ASC, created_at ASC";
        return array_map(self::mapRow(...), Database::get()->query($sql)->fetchAll());
    }

    public static function obtenerPorId(int $id): ?array
    {
        $stmt = Database::get()->prepare('SELECT * FROM nosotros_secciones WHERE id = ? LIMIT 1');
        $stmt->execute([$id]);
        $fila = $stmt->fetch();
        return $fila ? self::mapRow($fila) : null;
    }

    /**
     * @param array $datos titulo, subtitulo?, body, imagenUrl?, activo?, orden?
     */
    public static function crear(array $datos): array
    {
        $db   = Database::get();
        $stmt = $db->prepare(
            'INSERT INTO nosotros_secciones (titulo, subtitulo, body, imagen_url, activo, orden)
             VALUES (?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            $datos['titulo'],
            $datos['subtitulo'] ?? null,
            $datos['body'],
            $datos['imagenUrl'] ?? null,
            isset($datos['activo']) ? (int) (bool) $datos['activo'] : 1,
            (int) ($datos['orden'] ?? 0),
        ]);

        return self::obtenerPorId((int) $db->lastInsertId());
    }

    public static function actualizar(int $id, array $datos): ?array
    {
        $actual = self::obtenerPorId($id);
        if (!$actual) {
            return null;
        }

        $stmt = Database::get()->prepare(
            'UPDATE nosotros_secciones SET
                titulo = ?, subtitulo = ?, body = ?, imagen_url = ?, activo = ?, orden = ?
             WHERE id = ?'
        );
        $stmt->execute([
            $datos['titulo'] ?? $actual['titulo'],
            array_key_exists('subtitulo', $datos) ? $datos['subtitulo'] : $actual['subtitulo'],
            $datos['body'] ?? $actual['body'],
            array_key_exists('imagenUrl', $datos) ? $datos['imagenUrl'] : $actual['imagenUrl'],
            isset($datos['activo']) ? (int) (bool) $datos['activo'] : (int) $actual['activo'],
            (int) ($datos['orden'] ?? $actual['orden']),
            $id,
        ]);

        return self::obtenerPorId($id);
    }

    public static function eliminar(int $id): ?array
    {
        $actual = self::obtenerPorId($id);
        if (!$actual) {
            return null;
        }
        $stmt = Database::get()->prepare('DELETE FROM nosotros_secciones WHERE id = ?');
        $stmt->execute([$id]);
        return $actual;
    }
}
