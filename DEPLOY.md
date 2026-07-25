# Checklist de deploy — MIRAIA

Este proyecto no tiene deploy automático: el front se exporta a estático y se
sube a SiteGround por FTP, y el back (`php-api/`) se sube por FTP aparte.
Seguir este orden siempre, sin saltear pasos — la mayoría de los bugs raros
que tuvimos (500 al guardar, imágenes rotas, "This page couldn't load") salieron
de saltear uno de estos pasos, no del código en sí.

## 0. Antes de arrancar

- [ ] `npx tsc --noEmit` sin errores.
- [ ] `php -l` sobre cualquier archivo PHP que se haya tocado (o `for f in $(find php-api -name "*.php"); do php -l "$f"; done`).
- [ ] Revisar `git status` / `git diff` y tener claro qué archivos cambiaron en esta tanda.

## 1. Base de datos (si hay migraciones nuevas)

- [ ] Mirar `sql/` y correr en phpMyAdmin **todas** las `migration_XXX_*.sql` que
      todavía no se hayan corrido en producción, **en orden numérico**.
- [ ] Nunca subir código PHP que dependa de una migración sin haberla corrido antes
      (o vas a tener "Unknown column" / 500 al primer request que la use).

## 2. Backend (`php-api/`)

- [ ] Subir por FTP **toda la carpeta `php-api/`**, no solo los archivos que
      creas que cambiaron — un deploy parcial (algunos `.php` viejos +
      algunas `lib/` nuevas) fue la causa del 500 que tuvimos al guardar un
      producto. Pisar todo es más seguro que tratar de adivinar cuáles cambiaron.
- [ ] Confirmar que `php-api/.env` en el servidor tiene todas las variables que
      necesita el código nuevo (hoy: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`,
      `CLOUDINARY_API_SECRET`, además de las de siempre). Ese archivo nunca se
      sube solo — hay que revisarlo a mano cuando se agregan variables nuevas.

## 3. Frontend

- [ ] `npm run export` — confirmar que termina sin errores y lista todas las
      páginas esperadas (`/alfombras-modulares/[slug]`, `/pisos-tecnicos/[slug]`, etc.).
- [ ] **Borrar en el servidor TODO lo que genera el export antes de subir lo
      nuevo — no solo `_next/`.** Concretamente, dentro de `public_html/`:
      `_next/`, `alfombras-modulares/`, `pisos-tecnicos/`, `productos/`,
      `admin/`, `contacto/`, `nosotros/`, y los archivos sueltos de la raíz
      (`index.html`, `404.html`, `sitemap.xml`, `robots.txt`, `.htaccess`).
      **NO tocar** `api/` (el backend) ni `uploads/` (certificados PDF reales
      que subió el admin — el build no los regenera).
      Si el FTP tiene "sincronizar y borrar lo que no está en origen"
      (FileZilla: *Synchronize directories*), usarlo — apuntado solo a esas
      carpetas, nunca a la raíz entera.
      Por qué importa TODO y no solo `_next/`: cada página HTML de producto
      queda "casada" con los chunks JS de SU build. Si se sube `_next/`
      nuevo pero se deja alguna carpeta de producto vieja sin reemplazar
      (ej. no se volvió a subir `alfombras-modulares/cauce-.../` en un
      deploy anterior), esa página vieja sigue apuntando a chunks que ya no
      existen → "This page couldn't load" / "Connection closed" en esa
      página puntual, aunque el resto del sitio esté bien.
- [ ] Subir el `/out` completo nuevo encima.

## 4. Después de subir todo

- [ ] SiteGround → Site Tools → **PHP Manager** → reiniciar PHP (por OPcache:
      a veces sirve una versión vieja de un `.php` en memoria aunque el
      archivo ya se haya reemplazado en disco).
- [ ] SiteGround → Site Tools → **Speed → Caching** → Flush/Purge cache.
- [ ] Confirmar que no quedaron carpetas de producto ni chunks de builds
      viejos dando vueltas (si el FTP no borra automático al sincronizar,
      revisar a mano cada tanto que `public_html/` no tenga mezcla de
      páginas de distintos deploys).

## 5. Verificar

- [ ] Entrar a 2-3 páginas de producto reales (una de cada línea) en una
      pestaña nueva / incógnito y confirmar que cargan sin error de consola.
- [ ] Loguearse en `/admin/`, editar un producto (cambiar cualquier campo) y
      guardar — confirmar que NO tira "Error interno del servidor.".
- [ ] Si se tocó algo de categorías/variantes: crear o editar una variante y
      confirmar que la vista previa de imágenes de Cloudinary aparece en el form.
