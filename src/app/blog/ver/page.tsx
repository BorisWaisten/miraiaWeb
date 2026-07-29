'use client';

import { useEffect, useState } from 'react';
import { SiteNav } from '@/components/public/SiteNav';
import { SiteFooter } from '@/components/public/SiteFooter';
import { BlogPostDetalle } from '@/components/public/BlogPostDetalle';
import { apiGet } from '@/lib/api';
import type { BlogPost } from '@/models/blog';

/**
 * Detalle de posteo FALLBACK (client-side). Solo lo sirve el .htaccess
 * cuando /blog/<slug>/ no existe como carpeta estática (posteo creado
 * después del último build). Mismo patrón que /productos/ver/.
 */
export default function VerBlogPostPage() {
  const [post, setPost] = useState<BlogPost | null | undefined>(undefined);

  useEffect(() => {
    const slug =
      new URLSearchParams(window.location.search).get('slug') ??
      window.location.pathname.match(/blog\/([^/]+)/)?.[1] ??
      null;
    apiGet<BlogPost[]>('/blog.php').then((res) => {
      const p = res.data?.find((x) => x.slug === slug) ?? null;
      setPost(p);
      if (p) {
        document.title = `${p.titulo} | Blog Miraia`;
      }
    });
  }, []);

  return (
    <div className="bg-graphite">
      <SiteNav />
      <main className="px-8 py-16 md:px-12">
        {post === undefined ? (
          <p className="text-sm text-graphite-muted">Cargando…</p>
        ) : post === null ? (
          <p className="text-sm text-graphite-muted">Posteo no encontrado.</p>
        ) : (
          <BlogPostDetalle post={post} />
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
