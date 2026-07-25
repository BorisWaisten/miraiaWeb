'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { SiteNav } from '@/components/public/SiteNav';
import { SiteFooter } from '@/components/public/SiteFooter';
import { apiGet } from '@/lib/api';
import { urlBlogPost, type BlogPost } from '@/models/blog';

/**
 * Listado de blog — categorías como acordeón (colapsadas por default); al
 * abrir una, sus posteos aparecen como filas horizontales (imagen + título +
 * resumen), estilo referencia del cliente (euromaglia.com.ar/blog). El
 * detalle del posteo (/blog/<slug>/) no cambia.
 */
export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[] | null>(null);
  const [abiertas, setAbiertas] = useState<Set<string>>(new Set());

  useEffect(() => {
    apiGet<BlogPost[]>('/blog.php').then((res) => setPosts(res.data ?? []));
  }, []);

  function toggle(categoria: string) {
    setAbiertas((prev) => {
      const next = new Set(prev);
      if (next.has(categoria)) next.delete(categoria);
      else next.add(categoria);
      return next;
    });
  }

  return (
    <div className="bg-graphite">
      <SiteNav />

      <section className="px-8 py-16 md:px-12">
        <div className="mb-10">
          <p className="mb-3 text-[10px] uppercase tracking-widest2 text-bronze">Blog</p>
          <h1 className="font-serif text-3xl font-medium text-white">Notas técnicas</h1>
        </div>

        {posts === null ? (
          <p className="text-sm text-graphite-muted">Cargando…</p>
        ) : posts.length === 0 ? (
          <p className="text-sm text-graphite-muted">Todavía no hay artículos publicados.</p>
        ) : (
          <div className="border-t border-graphite-border">
            {[...new Set(posts.map((p) => p.categoria ?? ''))]
              .sort((a, b) => (a === '' ? 1 : b === '' ? -1 : a.localeCompare(b)))
              .map((grupo) => {
                const deGrupo = posts.filter((p) => (p.categoria ?? '') === grupo);
                const abierta = abiertas.has(grupo);
                return (
                  <div key={grupo || '_sin'} className="border-b border-graphite-border">
                    <button
                      type="button"
                      onClick={() => toggle(grupo)}
                      aria-expanded={abierta}
                      className="flex w-full items-center justify-between py-6 text-left"
                    >
                      <span className="font-serif text-xl font-medium text-white">
                        {grupo || 'Otros'}
                        <span className="ml-3 text-sm font-sans text-graphite-muted">({deGrupo.length})</span>
                      </span>
                      <span
                        className={`text-xl text-bronze transition-transform duration-200 ${abierta ? 'rotate-45' : ''}`}
                        aria-hidden
                      >
                        +
                      </span>
                    </button>

                    {abierta && (
                      <div className="space-y-px bg-graphite-border pb-8">
                        {deGrupo.map((post) => (
                          <Link
                            key={post.id}
                            href={urlBlogPost(post)}
                            className="flex gap-5 bg-graphite p-4 transition-opacity hover:opacity-90 sm:gap-6 sm:p-5"
                          >
                            <div className="h-24 w-28 shrink-0 bg-graphite-tile sm:h-32 sm:w-44">
                              {post.imagenPortada ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={post.imagenPortada}
                                  alt={post.titulo}
                                  className="h-full w-full object-cover"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="flex h-full items-center justify-center text-[10px] text-graphite-muted">
                                  Sin imagen
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-serif text-base text-white sm:text-lg">{post.titulo}</p>
                              {post.resumen && (
                                <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-mist/80">
                                  {post.resumen}
                                </p>
                              )}
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        )}
      </section>

      <SiteFooter />
    </div>
  );
}
