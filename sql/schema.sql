-- ──────────────────────────────────────────────────────────────
-- MIRAIA — Esquema de base de datos
-- Motor: MySQL / MariaDB (estándar SiteGround)
-- DB destino: dbqz90fyfdd1lp
-- ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS admins (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email         VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  nombre        VARCHAR(120) NOT NULL DEFAULT 'Admin',
  activo        TINYINT(1)   NOT NULL DEFAULT 1,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Catálogo de productos. NO incluye campo de precio: el sitio es de
-- exhibición y consulta para arquitectos/estudios (modelo B2B contract).
CREATE TABLE IF NOT EXISTS productos (
  id                 INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug               VARCHAR(160) NOT NULL UNIQUE,
  nombre             VARCHAR(160) NOT NULL,
  categoria          ENUM('piso_tecnico', 'alfombra_modular', 'vinilico_lvt') NOT NULL,
  descripcion_corta  VARCHAR(280) NOT NULL,
  descripcion_larga  TEXT NULL,
  -- Especificaciones técnicas flexibles (material, dimensiones, resistencia, etc.)
  especificaciones   JSON NULL,
  -- Ruta relativa pública de la imagen principal, ej: /uploads/productos/<uuid>.jpg
  imagen_principal   VARCHAR(255) NULL,
  -- Array JSON de rutas relativas adicionales para galería
  imagenes_galeria   JSON NULL,
  destacado          TINYINT(1) NOT NULL DEFAULT 0,
  activo             TINYINT(1) NOT NULL DEFAULT 1,
  orden              INT NOT NULL DEFAULT 0,
  created_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_productos_categoria (categoria),
  INDEX idx_productos_activo (activo),
  INDEX idx_productos_orden (orden)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Proyectos realizados (sección "Proyectos" del home, layout 2:1 en marfil).
CREATE TABLE IF NOT EXISTS proyectos (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug          VARCHAR(160) NOT NULL UNIQUE,
  nombre        VARCHAR(160) NOT NULL,
  etiqueta      VARCHAR(160) NOT NULL,        -- ej: "Oficinas corporativas · CABA"
  producto_id   INT UNSIGNED NULL,
  imagen        VARCHAR(255) NULL,
  destacado_principal TINYINT(1) NOT NULL DEFAULT 0, -- true = card grande (2/3 del grid)
  orden         INT NOT NULL DEFAULT 0,
  activo        TINYINT(1) NOT NULL DEFAULT 1,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_proyectos_producto FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
