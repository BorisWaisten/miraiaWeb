import type { MetadataRoute } from 'next';
import { getProductosBuild, getBlogPostsBuild, SITE_URL } from '@/lib/seo';
import { urlProducto } from '@/models/producto';
import { urlBlogPost } from '@/models/blog';

// Ítem 02 del doc SEO: sitemap.xml generado en el build con todas las
// páginas públicas. Subirlo a Search Console una sola vez.
export const dynamic = 'force-static';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [productos, posts] = await Promise.all([getProductosBuild(), getBlogPostsBuild()]);
  return [
    { url: `${SITE_URL}/`, priority: 1 },
    { url: `${SITE_URL}/productos/`, priority: 0.8 },
    { url: `${SITE_URL}/blog/`, priority: 0.6 },
    { url: `${SITE_URL}/nosotros/`, priority: 0.5 },
    ...productos.map((p) => ({
      url: new URL(urlProducto(p), SITE_URL).href,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : undefined,
      priority: 0.7,
    })),
    ...posts.map((p) => ({
      url: new URL(urlBlogPost(p), SITE_URL).href,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : undefined,
      priority: 0.6,
    })),
  ];
}
