'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { SiteNav } from '@/components/public/SiteNav';
import { SiteFooter } from '@/components/public/SiteFooter';
import { apiGet } from '@/lib/api';
import type { Producto } from '@/models/producto';

/**
 * Productos — grilla de series. Cada card muestra la imagen principal y el
 * nombre; al clickear se va al detalle (/productos/ver/?slug=...).
 */
export default function ProductosPage() {
  const [productos, setProductos] = useState<Producto[] | null>(null);

  useEffect(() => {
    apiGet<Producto[]>('/productos.php').then((res) => setProductos(res.data ?? []));
  }, []);

  return (
    <div className="bg-graphite">
      <SiteNav />

      <section className="px-8 py-16 md:px-12">
        <div className="mb-10">
          <p className="mb-3 text-[10px] uppercase tracking-widest2 text-bronze">Productos</p>
          <h1 className="font-serif text-3xl font-medium text-white">Series</h1>
        </div>

        {productos === null ? (
          <p className="text-sm text-graphite-muted">Cargando…</p>
        ) : productos.length === 0 ? (
          <p className="text-sm text-graphite-muted">
            No hay productos disponibles por el momento.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-px bg-graphite-border sm:grid-cols-2 md:grid-cols-3">
            {productos.map((producto) => (
              <Link
                key={producto.id}
                href={`/productos/ver/?slug=${producto.slug}`}
                className="block bg-graphite transition-opacity hover:opacity-90"
              >
                <div className="relative h-[240px] bg-graphite-tile">
                  {producto.imagenPrincipal ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={producto.imagenPrincipal}
                      alt={producto.nombre}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-graphite-muted">
                      Sin imagen
                    </div>
                  )}
                </div>
                <div className="px-6 py-5">
                  <p className="font-serif text-base text-white">{producto.nombre}</p>
                  {producto.subtitulo && (
                    <p className="mt-1 text-[10px] uppercase tracking-wide text-graphite-muted">
                      {producto.subtitulo}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <SiteFooter />
    </div>
  );
}
