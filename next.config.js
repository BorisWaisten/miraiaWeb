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

  // Proxy dev → servidor remoto. Incompatible con output:export, por eso es mutuamente exclusivo.
  // ignaciom37.sg-host.com (hostname de staging original) dejó de resolver — dominio actual: miraia.com.ar.
  ...(!isExport && {
    async rewrites() {
      return [
        {
          source: '/api/:path*',
          destination: 'https://miraia.com.ar/api/:path*',
        },
        {
          source: '/uploads/:path*',
          destination: 'https://miraia.com.ar/uploads/:path*',
        },
      ];
    },
  }),
};

export default nextConfig;
