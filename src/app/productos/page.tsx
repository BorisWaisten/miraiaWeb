'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { SiteNav } from '@/components/public/SiteNav';
import { SiteFooter } from '@/components/public/SiteFooter';
import { apiGet } from '@/lib/api';
import { LINEAS, parseEspecificaciones, urlProducto, type LineaProducto, type Producto } from '@/models/producto';

/**
 * Categoría dentro de la línea (doc SEO — "crear categorías dentro de
 * productos"): antes de la migración 007 se derivaba de la spec
 * "Construcción" (Level Loop, Multi-Level Loop, Colorpoint…). Ahora prioriza
 * `producto.categoria` (migración 007); solo cae al parseo de specs para
 * productos viejos que todavía no tienen categoría asignada. Sin ninguna de
 * las dos → sin categoría (queda al final, sin título).
 */
function construccionDe(p: Producto): string {
  return (
    parseEspecificaciones(p.especificaciones).find(
      ([clave]) => clave.toLowerCase().replace('ó', 'o') === 'construccion',
    )?.[1] ?? ''
  );
}

function grupoDe(p: Producto): string {
  return p.categoria?.nombre ?? construccionDe(p);
}

/**
 * Productos — grillas de series agrupadas por línea de negocio
 * (Alfombras Modulares / Pisos Técnicos). Cada card linkea a su detalle
 * según la línea: /alfombras-modulares/<slug>/ o /pisos-tecnicos/<slug>/.
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
          <h1 className="font-serif text-3xl font-medium text-white">
            Alfombras Modulares y Pisos Técnicos para Arquitectura Contract
          </h1>
        </div>

        {productos === null ? (
          <p className="text-sm text-graphite-muted">Cargando…</p>
        ) : productos.length === 0 ? (
          <p className="text-sm text-graphite-muted">
            No hay productos disponibles por el momento.
          </p>
        ) : (
          (Object.keys(LINEAS) as LineaProducto[]).map((linea) => {
            const deLinea = productos.filter((p) => (p.linea ?? 'alfombra-modular') === linea);
            if (deLinea.length === 0) return null;

            // Agrupar por categoría (o construcción, para productos sin categoría asignada); los sin ninguna ('') van al final.
            const grupos = [...new Set(deLinea.map(grupoDe))].sort(
              (a, b) => (a === '' ? 1 : b === '' ? -1 : a.localeCompare(b)),
            );

            return (
              <div key={linea} className="mb-14 last:mb-0">
                <h2 className="mb-6 font-serif text-xl font-medium text-white">
                  {LINEAS[linea].plural}
                </h2>
                {grupos.map((grupo) => (
                  <div key={grupo || '_sin'} className="mb-8 last:mb-0">
                    {grupo && (
                      <h3 className="mb-4 text-[11px] uppercase tracking-widest2 text-bronze">
                        {grupo}
                      </h3>
                    )}
                    <div className="grid grid-cols-1 gap-px bg-graphite-border sm:grid-cols-2 md:grid-cols-3">
                      {deLinea
                        .filter((p) => grupoDe(p) === grupo)
                        .map((producto) => (
                    <Link
                      key={producto.id}
                      href={urlProducto(producto)}
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
                        <p className="font-serif text-lg text-white">{producto.nombre}</p>
                        {producto.subtitulo && (
                          <p className="mt-1.5 text-[10px] uppercase tracking-widest2 text-graphite-muted">
                            {producto.subtitulo}
                          </p>
                        )}
                        {producto.descripcionCorta && (
                          <p className="mt-3 line-clamp-2 text-[13px] leading-relaxed text-mist/80">
                            {producto.descripcionCorta}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                    </div>
                  </div>
                ))}
              </div>
            );
          })
        )}
      </section>

      <SiteFooter />
    </div>
  );
}
