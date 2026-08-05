import type { MetadataRoute } from 'next';
import { getProductosBuild, getBlogPostsBuild, SITE_URL } from '@/lib/seo';
import { urlProducto } from '@/models/producto';
import { urlBlogPost } from '@/models/blog';

// Ítem 02 del doc SEO: sitemap.xml generado en el build con todas las
// páginas públicas. Subirlo a Search Console una sola vez.
export const dynamic = 'force-static';

// `image: string[]` en cada entrada emite la extensión <image:image> del
// sitemap — le indica a Google explícitamente qué imagen corresponde a cada
// URL, en vez de depender de que el rastreo descubra las imágenes solo. Mejora
// la velocidad/cobertura de indexación en Google Imágenes.
// `new URL(ruta, SITE_URL)` deja pasar imagenPrincipal/imagenPortada
// absolutas (Cloudinary) tal cual, igual que en paginaProducto.tsx.
const abs = (ruta: string) => new URL(ruta, SITE_URL).href;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [productos, posts] = await Promise.all([getProductosBuild(), getBlogPostsBuild()]);
  return [
    { url: `${SITE_URL}/`, priority: 1, images: [abs('/og-image.png')] },
    { url: `${SITE_URL}/productos/`, priority: 0.8 },
    { url: `${SITE_URL}/proyectos/`, priority: 0.6 },
    { url: `${SITE_URL}/blog/`, priority: 0.6 },
    { url: `${SITE_URL}/nosotros/`, priority: 0.5 },
    ...productos.map((p) => ({
      url: new URL(urlProducto(p), SITE_URL).href,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : undefined,
      priority: 0.7,
      images: p.imagenPrincipal ? [abs(p.imagenPrincipal)] : undefined,
    })),
    ...posts.map((p) => ({
      url: new URL(urlBlogPost(p), SITE_URL).href,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : undefined,
      priority: 0.6,
      images: p.imagenPortada ? [abs(p.imagenPortada)] : undefined,
    })),
  ];
}
