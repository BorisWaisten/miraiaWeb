import type { Producto } from '@/models/producto';
import type { BlogPost } from '@/models/blog';

/**
 * Constantes y datos SEO usados EN TIEMPO DE BUILD (server components,
 * generateStaticParams, sitemap). No importar desde componentes 'use client'.
 */

export const SITE_URL = 'https://miraia.com.ar';

// La API PHP a consultar durante `next build` para conocer los slugs.
// Por defecto producción; override con BUILD_API_BASE_URL si cambia
// (el hostname de staging ignaciom37.sg-host.com dejó de resolver — dominio actual: miraia.com.ar).
const BUILD_API = process.env.BUILD_API_BASE_URL ?? 'https://miraia.com.ar/api';

let cache: Promise<Producto[]> | null = null;

/** Catálogo completo en build. Falla fuerte: sin catálogo no hay export válido. */
export function getProductosBuild(): Promise<Producto[]> {
  // `_build=` esquiva el caché dinámico de SiteGround, que puede servir
  // respuestas viejas de la API y hornear un catálogo desactualizado.
  cache ??= fetch(`${BUILD_API}/productos.php?_build=${Date.now()}`).then(async (res) => {
    if (!res.ok) {
      throw new Error(`No se pudo leer el catálogo desde ${BUILD_API} (HTTP ${res.status}).`);
    }
    return (((await res.json()) as { data?: Producto[] }).data ?? []) as Producto[];
  });
  return cache;
}

let cacheBlog: Promise<BlogPost[]> | null = null;

/** Posteos de blog publicados, en build. Falla fuerte, igual que el catálogo. */
export function getBlogPostsBuild(): Promise<BlogPost[]> {
  cacheBlog ??= fetch(`${BUILD_API}/blog.php?_build=${Date.now()}`).then(async (res) => {
    if (!res.ok) {
      throw new Error(`No se pudo leer el blog desde ${BUILD_API} (HTTP ${res.status}).`);
    }
    return (((await res.json()) as { data?: BlogPost[] }).data ?? []) as BlogPost[];
  });
  return cacheBlog;
}
