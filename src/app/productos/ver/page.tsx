'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { SiteNav } from '@/components/public/SiteNav';
import { SiteFooter } from '@/components/public/SiteFooter';
import { apiGet } from '@/lib/api';
import { CATEGORIA_LABEL, type Producto } from '@/models/producto';

/**
 * Detalle de producto — ficha técnica de exhibición, SIN precio ni botón de compra.
 *
 * Usa /productos/ver/?slug=... (query param) en vez de /productos/[slug]/ a
 * propósito: con `output: 'export'` cada ruta dinámica necesitaría conocerse
 * en build time (generateStaticParams), pero los productos se crean después
 * del build desde el panel admin — el query param resuelve esto sin rebuild.
 */
export default function ProductoDetallePage() {
  const [slug, setSlug] = useState<string | null>(null);
  const [producto, setProducto] = useState<Producto | null | undefined>(undefined); // undefined = cargando
  const [notFoundFlag, setNotFoundFlag] = useState(false);

  useEffect(() => {
    setSlug(new URLSearchParams(window.location.search).get('slug'));
  }, []);

  useEffect(() => {
    if (slug === null) return;
    if (slug === '') {
      setNotFoundFlag(true);
      return;
    }
    apiGet<Producto>(`/producto.php?slug=${encodeURIComponent(slug)}`).then((res) => {
      if (!res.ok || !res.data) {
        setNotFoundFlag(true);
        return;
      }
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

  const specs = producto.especificaciones ? Object.entries(producto.especificaciones) : [];

  return (
    <div className="bg-graphite">
      <SiteNav />

      <section className="grid grid-cols-1 gap-px bg-graphite-border md:grid-cols-2">
        <div className="relative min-h-[360px] bg-graphite-tile">
          {producto.imagenPrincipal ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={producto.imagenPrincipal} alt={producto.nombre} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-graphite-muted">Sin imagen</div>
          )}
        </div>

        <div className="bg-graphite px-8 py-12 md:px-12">
          <Link
            href="/productos/"
            className="mb-6 inline-block text-[11px] uppercase tracking-wide text-graphite-muted hover:text-bronze"
          >
            ← Volver al catálogo
          </Link>
          <p className="mb-3 text-[10px] uppercase tracking-widest2 text-bronze">{CATEGORIA_LABEL[producto.categoria]}</p>
          <h1 className="mb-5 font-serif text-3xl font-medium text-white">{producto.nombre}</h1>
          <p className="mb-8 max-w-md text-sm leading-relaxed text-graphite-muted">
            {producto.descripcionLarga || producto.descripcionCorta}
          </p>

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
