'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { SiteNav } from '@/components/public/SiteNav';
import { SiteFooter } from '@/components/public/SiteFooter';
import { apiGet } from '@/lib/api';
import type { Producto } from '@/models/producto';

export default function ProductoDetallePage() {
  const [slug, setSlug] = useState<string | null>(null);
  const [producto, setProducto] = useState<Producto | null | undefined>(undefined);
  const [notFoundFlag, setNotFoundFlag] = useState(false);
  const [imagenActiva, setImagenActiva] = useState(0);

  useEffect(() => {
    setSlug(new URLSearchParams(window.location.search).get('slug'));
  }, []);

  useEffect(() => {
    if (slug === null) return;
    if (slug === '') { setNotFoundFlag(true); return; }
    apiGet<Producto>(`/producto.php?slug=${encodeURIComponent(slug)}`).then((res) => {
      if (!res.ok || !res.data) { setNotFoundFlag(true); return; }
      setProducto(res.data);
    });
  }, [slug]);

  if (notFoundFlag) {
    return (
      <div className="bg-graphite">
        <SiteNav />
        <div className="px-8 py-24 text-center md:px-12">
          <p className="mb-4 text-sm text-graphite-muted">Producto no encontrado.</p>
          <Link href="/productos/" className="text-[11px] uppercase tracking-wide text-bronze">
            ← Volver al catálogo
          </Link>
        </div>
        <SiteFooter />
      </div>
    );
  }

  if (!producto) {
    return (
      <div className="bg-graphite">
        <SiteNav />
        <div className="px-8 py-24 text-center text-sm text-graphite-muted md:px-12">Cargando…</div>
        <SiteFooter />
      </div>
    );
  }

  const specs    = producto.especificaciones ? Object.entries(producto.especificaciones) : [];
  const todasLasImagenes = [
    producto.imagenPrincipal,
    ...(producto.imagenesGaleria ?? []),
  ].filter(Boolean) as string[];

  return (
    <div className="bg-graphite">
      <SiteNav />

      <section className="grid grid-cols-1 gap-px bg-graphite-border md:grid-cols-2">
        {/* Galería de imágenes */}
        <div>
          <div className="relative min-h-[360px] bg-graphite-tile">
            {todasLasImagenes.length > 0 ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={todasLasImagenes[imagenActiva]}
                alt={producto.nombre}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-graphite-muted">
                Sin imagen
              </div>
            )}
          </div>
          {/* Miniaturas — solo si hay más de 1 imagen */}
          {todasLasImagenes.length > 1 && (
            <div className="flex gap-px bg-graphite-border">
              {todasLasImagenes.map((src, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setImagenActiva(i)}
                  className={`relative h-16 flex-1 bg-graphite-tile transition-opacity ${
                    imagenActiva === i ? 'ring-1 ring-inset ring-bronze' : 'opacity-50 hover:opacity-80'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Ficha */}
        <div className="bg-graphite px-8 py-12 md:px-12">
          <Link
            href="/productos/"
            className="mb-6 inline-block text-[11px] uppercase tracking-wide text-graphite-muted hover:text-bronze"
          >
            ← Volver al catálogo
          </Link>
          <p className="mb-3 text-[10px] uppercase tracking-widest2 text-bronze">
            {producto.catalogoNombre}
          </p>
          <h1 className="mb-5 font-serif text-3xl font-medium text-white">{producto.nombre}</h1>

          {/* Descripción larga: renderiza HTML del editor Tiptap */}
          {producto.descripcionLarga ? (
            <div
              className="mb-8 max-w-md text-sm leading-relaxed text-graphite-muted
                [&_h2]:mb-2 [&_h2]:mt-4 [&_h2]:font-serif [&_h2]:text-base [&_h2]:text-white
                [&_h3]:mb-1 [&_h3]:mt-3 [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-white
                [&_p]:mb-2 [&_ul]:mb-2 [&_ul]:ml-4 [&_ul]:list-disc
                [&_ol]:mb-2 [&_ol]:ml-4 [&_ol]:list-decimal
                [&_strong]:font-semibold [&_strong]:text-white"
              dangerouslySetInnerHTML={{ __html: producto.descripcionLarga }}
            />
          ) : (
            <p className="mb-8 max-w-md text-sm leading-relaxed text-graphite-muted">
              {producto.descripcionCorta}
            </p>
          )}

          {specs.length > 0 && (
            <dl className="mb-10 max-w-md divide-y divide-graphite-border border-y border-graphite-border">
              {specs.map(([clave, valor]) => (
                <div key={clave} className="flex justify-between py-3 text-xs">
                  <dt className="capitalize text-graphite-muted">{clave}</dt>
                  <dd className="text-white">{valor}</dd>
                </div>
              ))}
            </dl>
          )}

          <Link
            href="/contacto/"
            className="inline-block bg-bronze px-7 py-3 text-[11px] uppercase tracking-wide text-obsidian"
          >
            Solicitar información
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
