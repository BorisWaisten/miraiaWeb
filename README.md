# MIRAIA — Sitio web (catálogo + panel de administración)

Sitio corporativo para MIRAIA (superficies para arquitectura contract). Catálogo público de exhibición — **sin precios** — y panel de administración privado para gestionar productos dinámicamente.

## Arquitectura (actualizada — sin Node en el servidor)

El hosting SiteGround de este proyecto **no soporta Node.js** (confirmado por soporte). Por eso la arquitectura es:

- **Frontend**: Next.js (App Router) exportado como **sitio 100% estático** (`output: 'export'` en `next.config.js`) — solo HTML/CSS/JS, sin servidor. Se sube por FTP a `public_html/`.
- **Backend**: **PHP + MySQL**, corriendo nativamente en el mismo hosting (Apache + PHP, sin Node, sin Composer, sin dependencias externas). Vive en `php-api/` y se sube por FTP a `public_html/api/`.
- **Base de datos**: MySQL `dbqz90fyfdd1lp` en SiteGround — accedida con `DB_HOST=localhost` porque PHP corre en el mismo servidor (esto es justamente lo que no se podía lograr antes con Node corriendo fuera de SiteGround).
- **Todo lo dinámico** (catálogo, login admin, alta/edición/borrado de productos, upload de imagen) pasa por `fetch()` del lado del cliente hacia la API PHP — no hay Server Components con DB directa, ni API routes de Next, ni middleware.

```
miraiaWeb/
├── public/uploads/productos/   # Espejo local de desarrollo de las imágenes
├── sql/schema.sql                # DDL: tablas admins, productos, proyectos (sin cambios)
├── src/                           # Frontend Next.js — exporta a out/ con `npm run build`
│   ├── lib/api.ts                 # Cliente fetch centralizado hacia la API PHP
│   ├── models/                    # Tipos producto.ts / proyecto.ts (coinciden con la respuesta de la API)
│   ├── app/
│   │   ├── page.tsx                 # Home — client component, fetch a /api/productos.php + /api/proyectos.php
│   │   ├── productos/page.tsx       # Catálogo filtrable (?categoria=)
│   │   ├── productos/ver/page.tsx   # Detalle — /productos/ver/?slug=... (query param, no [slug])
│   │   └── admin/
│   │       ├── login/page.tsx       # Único público dentro de /admin
│   │       ├── layout.tsx           # Guard de UX: llama a /api/admin/me.php, redirige si no hay sesión
│   │       ├── page.tsx             # Dashboard
│   │       └── productos/
│   │           ├── page.tsx            # Listado + tabla CRUD
│   │           ├── nuevo/page.tsx
│   │           └── editar/page.tsx     # /admin/productos/editar/?id=... (query param, no [id])
│   └── components/{public,admin}/
└── php-api/                      # Backend — se sube tal cual a public_html/api/
    ├── .env                        # Secretos reales (NO se commitea) — copiar de .env.example
    ├── config.php                  # Carga .env, CORS, manejo de errores
    ├── .htaccess                   # Bloquea acceso directo a lib/ y .env
    ├── lib/
    │   ├── Database.php             # PDO (MySQL), prepared statements siempre
    │   ├── Jwt.php                  # JWT HS256 hecho a mano (sin Composer)
    │   ├── Auth.php                 # Cookie httpOnly de sesión, requerirSesion()
    │   ├── Upload.php                # move_uploaded_file() a public_html/uploads/productos/
    │   ├── Productos.php / Proyectos.php  # Acceso a datos
    │   └── Validacion.php            # Validación de inputs (equivalente a los esquemas zod previos)
    ├── productos.php / producto.php / proyectos.php   # ── PÚBLICOS, solo lectura
    ├── admin/
    │   ├── login.php / logout.php / me.php
    │   ├── productos.php             # GET listado admin / POST crear (multipart + imagen)
    │   └── producto.php              # GET detalle / POST actualizar (?id=) / DELETE (?id=)
    └── scripts/crear-admin.php       # Bootstrap del primer usuario admin (CLI o HTTP con token)
```

**Por qué query params en vez de rutas dinámicas (`[slug]`, `[id]`):** con `output: 'export'` cada ruta tiene que poder resolverse en build time. Los productos se crean después del build, desde el panel — por eso `/productos/ver/?slug=...` y `/admin/productos/editar/?id=...` en vez de segmentos dinámicos, y los datos se piden siempre del lado del cliente.

**Separación pública/admin:** `php-api/productos.php`, `producto.php` y `proyectos.php` son de solo lectura y públicos. Todo lo que muta datos vive bajo `php-api/admin/*` y exige sesión válida (`Auth::requerirSesion()` al principio de cada script) — la protección real está siempre en el servidor PHP, nunca solo en el frontend.

## Paleta y tipografía (Manual de Identidad, Mayo 2025)

| Token      | Hex       | Uso                                  |
|------------|-----------|---------------------------------------|
| Obsidiana  | `#111111` | Fondo principal, tipografía           |
| Grafito    | `#2C2C2A` | Fondo logo, secciones oscuras         |
| Cemento    | `#5F5E5A` | Cuerpo de texto secundario            |
| Niebla     | `#D3D1C7` | Bordes, separadores                   |
| Marfil     | `#F1EFE8` | Fondos claros, sección proyectos      |
| Bronce     | `#C8A96E` | **Único acento** — CTAs, detalles     |

Tipografía: serif para títulos display (Playfair Display) y sans para cuerpo/UI (Inter) — ver `src/app/layout.tsx`.

## Variables de entorno

Dos `.env` separados:

- `.env.local` (raíz, frontend): básicamente solo `NEXT_PUBLIC_API_BASE_URL`. Ya no tiene secretos — el JWT y las credenciales de DB viven del lado de PHP, nunca en el bundle del navegador.
- `php-api/.env` (backend): `DB_*`, `JWT_SECRET`, `UPLOADS_ABS_PATH`, `ADMIN_BOOTSTRAP_TOKEN`. Copiar de `php-api/.env.example`. **Nunca lo subas con valores reales a un repo público.**

## Despliegue en SiteGround (dominio temporal `ignaciom37.sg-host.com`)

1. **Base de datos**: ya tenés `dbqz90fyfdd1lp` creada. Cargá el esquema una sola vez desde phpMyAdmin (Site Tools → MySQL → phpMyAdmin): pestaña SQL → pegar el contenido de `sql/schema.sql` → Continuar.
2. **Completar `php-api/.env`**: `DB_HOST=localhost`, `DB_NAME=dbqz90fyfdd1lp`, usuario/password reales de SiteGround, `JWT_SECRET` (generar con `php -r "echo bin2hex(random_bytes(32));"`), `UPLOADS_ABS_PATH` con la ruta absoluta real (la ves en Site Tools → File Manager o en la columna "Remote site" de FileZilla, algo como `/home/USUARIO/www/ignaciom37.sg-host.com/public_html/uploads/productos`), y `ADMIN_BOOTSTRAP_TOKEN` (un valor random temporal).
3. **Crear la carpeta de uploads**: por File Manager o FTP, creá `public_html/uploads/productos/` con permisos de escritura (755).
4. **Build estático del frontend**: localmente, `npm install && npm run build`. Esto genera la carpeta `out/` con HTML/CSS/JS listo para subir — no hace falta `node_modules` en el servidor.
5. **Subir por FTP (FileZilla)**:
   - Contenido de `out/` → directo a `public_html/` (raíz del dominio).
   - Carpeta `php-api/` completa (con tu `.env` ya completado) → a `public_html/api/`.
   - **No subas** `node_modules`, `.next`, `src`, ni nada del proyecto Next sin compilar — el servidor no los necesita ni los puede ejecutar.
6. **Crear el primer usuario admin**:
   - Con SSH: `php crear-admin.php admin@miraia.com.ar "contraseñaSegura123"` parado en `public_html/api/scripts/`.
   - Sin SSH: visitar una vez `https://ignaciom37.sg-host.com/api/scripts/crear-admin.php?token=TU_TOKEN&email=admin@miraia.com.ar&password=contraseñaSegura123` desde el navegador.
   - Después de cualquiera de las dos opciones: **borrar `scripts/crear-admin.php` del servidor o quitar `ADMIN_BOOTSTRAP_TOKEN` de `.env`**.
7. **Verificación**: `https://ignaciom37.sg-host.com/` (home público) y `https://ignaciom37.sg-host.com/admin/login/` (panel).

Cuando se migre al dominio definitivo, solo hay que repetir el FTP (rebuild + re-subida) — al ser estático no hay "restart" de proceso ni Node App que configurar.

### Desarrollo local

- Frontend: `npm run dev` (Next corre en `http://localhost:3000`).
- Backend: `php -S localhost:8000 -t php-api` (PHP trae servidor embebido, no hace falta Apache local).
- En `.env.local` del frontend, `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000`.
- En `php-api/.env`, `CORS_ALLOWED_ORIGINS=http://localhost:3000` para que las cookies de sesión funcionen cross-origin en dev.

## Seguridad implementada

- Contraseñas de admin hasheadas con `password_hash()` (bcrypt nativo de PHP).
- Sesión vía JWT propio (HS256, sin dependencias) en cookie **httpOnly + secure + SameSite=Lax**.
- Cada endpoint mutante (`php-api/admin/*`) llama a `Auth::requerirSesion()` antes de tocar la base o el filesystem — corta con 401 si no hay token válido. Esta es la protección real; el guard del lado del frontend (`admin/layout.tsx` llamando a `/api/admin/me.php`) es solo para UX (evitar el flash de contenido antes de redirigir).
- Queries 100% parametrizadas (PDO prepared statements, `PDO::ATTR_EMULATE_PREPARES => false`) — sin concatenación de strings, previene inyección SQL.
- Validación de tipo MIME real (vía `finfo`, no la extensión ni el Content-Type declarado por el navegador) y tamaño máximo de archivo antes de escribir a disco.
- `php-api/.htaccess` bloquea acceso HTTP directo a `.env`, `config.php` y la carpeta `lib/`.
