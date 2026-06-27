<?php
defined('MIRAIA_API_BOOT') or die('Acceso directo no permitido.');

/** Conexión PDO singleton hacia la base `dbqz90fyfdd1lp` (MySQL en SiteGround). */
final class Database
{
    private static ?PDO $instancia = null;

    public static function get(): PDO
    {
        if (self::$instancia === null) {
            $host = env('DB_HOST');
            $port = env('DB_PORT', '3306');
            $name = env('DB_NAME');
            $user = env('DB_USER');
            $pass = env('DB_PASSWORD');

            if (!$host || !$name || !$user) {
                throw new RuntimeException('Faltan variables de entorno de base de datos (DB_HOST/DB_NAME/DB_USER).');
            }

            $dsn = "mysql:host={$host};port={$port};dbname={$name};charset=utf8mb4";
            self::$instancia = new PDO($dsn, $user, $pass, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false, // fuerza prepared statements reales (anti SQL-injection)
            ]);
        }

        return self::$instancia;
    }
}
