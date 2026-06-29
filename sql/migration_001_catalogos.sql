-- ──────────────────────────────────────────────────────────────────────────────
-- MIRAIA — Migración 001: Catálogos dinámicos
-- Reemplaza el ENUM fijo `categoria` por una tabla `catalogos` con FK dinámica.
-- Motor: MySQL / MariaDB (SiteGround)
--
-- INSTRUCCIONES:
--   Ejecutar en orden en la DB dbqz90fyfdd1lp vía phpMyAdmin o consola MySQL.
--   Puede correrse en una sola sesión. Si ya existe la tabla `catalogos`, el
--   CREATE TABLE ... IF NOT EXISTS es idempotente y se saltea sin error.
-- ──────────────────────────────────────────────────────────────────────────────

-- 1. Crear tabla de catálogos
-- ──────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS catalogos (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug         VARCHAR(160) NOT NULL UNIQUE,
  nombre       VARCHAR(160) NOT NULL,
  descripcion  VARCHAR(500) NULL,
  activo       TINYINT(1)   NOT NULL DEFAULT 1,
  orden        INT          NOT NULL DEFAULT 0,
  created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_catalogos_activo (activo),
  INDEX idx_catalogos_orden (orden)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Seed: las tres categorías originales (slugs idénticos al ENUM anterior)
-- ──────────────────────────────────────────────────────────────────────────────
INSERT IGNORE INTO catalogos (slug, nombre, activo, orden) VALUES
  ('piso_tecnico',    'Piso técnico',     1, 1),
  ('alfombra_modular','Alfombra modular', 1, 2),
  ('vinilico_lvt',   'Vinílico LVT',     1, 3);

-- 3. Agregar columna catalogo_id a productos (nullable para poder backfillear)
-- ──────────────────────────────────────────────────────────────────────────────
ALTER TABLE productos
  ADD COLUMN catalogo_id INT UNSIGNED NULL AFTER categoria;

-- 4. Backfill: asignar catalogo_id según el ENUM existente
-- ──────────────────────────────────────────────────────────────────────────────
UPDATE productos p
  JOIN catalogos c ON p.categoria = c.slug
  SET p.catalogo_id = c.id;

-- 5. Hacer catalogo_id NOT NULL y agregar FK
-- ──────────────────────────────────────────────────────────────────────────────
ALTER TABLE productos
  MODIFY COLUMN catalogo_id INT UNSIGNED NOT NULL;

ALTER TABLE productos
  ADD CONSTRAINT fk_productos_catalogo
    FOREIGN KEY (catalogo_id) REFERENCES catalogos(id) ON DELETE RESTRICT,
  ADD INDEX idx_productos_catalogo (catalogo_id);

-- 6. Eliminar columna ENUM antigua
-- ──────────────────────────────────────────────────────────────────────────────
ALTER TABLE productos
  DROP COLUMN categoria;
