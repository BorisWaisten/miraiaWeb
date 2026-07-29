'use client';

import { useEffect, useState } from 'react';
import { SiteNav } from '@/components/public/SiteNav';
import { SiteFooter } from '@/components/public/SiteFooter';
import { ProductoDetalle } from '@/components/public/ProductoDetalle';
import { apiGet } from '@/lib/api';
import { LINEAS, type Producto } from '@/models/producto';

/**
 * Detalle de producto FALLBACK (client-side). Solo lo sirve el .htaccess
 * cuando /alfombras-modulares/<slug>/ no existe como carpeta estática
 * (producto creado después del último build). Las URLs canónicas con SEO
 * completo son las estáticas — ver alfombras-modulares/[slug]/page.tsx.
 * Lee el slug del query (?slug=) o del pathname (rewrite de Apache).
 */
export default function VerProductoPage() {
  const [producto, setProducto] = useState<Producto | null | undefined>(undefined);

  useEffect(() => {
    const slug =
      new URLSearchParams(window.location.search).get('slug') ??
      window.location.pathname.match(/(?:alfombras-modulares|pisos-tecnicos)\/([^/]+)/)?.[1] ??
      null;
    apiGet<Producto[]>('/productos.php').then((res) => {
      const p = res.data?.find((x) => x.slug === slug) ?? null;
      setProducto(p);
      if (p) {
        const etiqueta = LINEAS[p.linea]?.etiqueta ?? 'Alfombra Modular';
        document.title = `${p.nombre} — ${p.subtitulo ?? etiqueta} | Miraia`;
      }
    });
  }, []);

  return (
    <div className="bg-graphite">
      <SiteNav />
      <main className="px-8 py-16 md:px-12">
        {producto === undefined ? (
          <p className="text-sm text-graphite-muted">Cargando…</p>
        ) : producto === null ? (
          <p className="text-sm text-graphite-muted">Producto no encontrado.</p>
        ) : (
          <ProductoDetalle producto={producto} />
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
