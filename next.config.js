/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // El hosting SiteGround de este proyecto NO soporta Node.js (confirmado por
  // soporte) — solo Apache + PHP + MySQL. Por eso el frontend se exporta como
  // sitio 100% estático (HTML/CSS/JS) y se sube por FTP a public_html/.
  // Todo lo dinámico (catálogo, login, CRUD de productos, upload de imagen)
  // pasa por la API en PHP (carpeta php-api/, ver README) vía fetch del lado
  // del cliente — no hay Server Components con acceso a DB ni API routes.
  output: 'export',
  images: {
    unoptimized: true, // sin servidor de Next no hay /_next/image; ya usamos <img> nativo
  },
  trailingSlash: true, // genera carpeta/index.html por ruta — más compatible con Apache estático
};

module.exports = nextConfig;
