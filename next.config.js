/** @type {import('next').NextConfig} */

// NEXT_EXPORT=true  →  genera la carpeta /out para subir al servidor (FTP)
// (sin esta variable)  →  modo dev con proxy al servidor remoto
const isExport = process.env.NEXT_EXPORT === 'true';

const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  trailingSlash: true,

  // Solo en modo export estático
  ...(isExport && { output: 'export' }),

  // Proxy dev/prod → backend PHP. Incompatible con output:export, por eso es mutuamente exclusivo.
  // Desde la migración del front a Vercel, el back vive en el subdominio
  // api.miraia.com.ar (antes compartía dominio con el front en SiteGround).
  // OJO: si esto vuelve a apuntar a miraia.com.ar, como el front AHORA vive
  // en ese mismo dominio (Vercel), el rewrite se reenvía a sí mismo — loop
  // infinito de redirects y "Failed to fetch" en todo el sitio.
  ...(!isExport && {
    async rewrites() {
      return [
        {
          source: '/api/:path*',
          destination: 'https://api.miraia.com.ar/api/:path*',
        },
        {
          source: '/uploads/:path*',
          destination: 'https://api.miraia.com.ar/uploads/:path*',
        },
      ];
    },
  }),
};

export default nextConfig;
