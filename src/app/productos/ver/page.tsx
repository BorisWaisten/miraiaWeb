'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { SiteNav } from '@/components/public/SiteNav';
import { SiteFooter } from '@/components/public/SiteFooter';
import { apiGet } from '@/lib/api';
import type { Producto } from '@/models/producto';

/**
 * Detalle de producto — /productos/ver/?slug=... (query param, no [slug],
 * por el export estático). Título, subtítulo, descripciones y carrusel de
 * imágenes (una visible, el resto se navega con flechas/miniaturas).
 * Se busca el producto dentro del listado público: son pocas series y así
 * no hace falta un endpoint de detalle.
 */
export default function VerProductoPage() {
  const [producto, setProducto] = useState<Producto | null | undefined>(undefined);

  useEffect(() => {
    const slug = new URLSearchParams(window.location.search).get('slug');
    apiGet<Producto[]>('/productos.php').then((res) => {
      setProducto(res.data?.find((p) => p.slug === slug) ?? null);
    });
  }, []);

  return (
    <div className="bg-graphite">
      <SiteNav />

      <section className="px-8 py-16 md:px-12">
        <Link href="/productos/" className="text-[11px] uppercase tracking-wide text-bronze">
          ← Todos los productos
        </Link>

        {producto === undefined ? (
          <p className="mt-10 text-sm text-graphite-muted">Cargando…</p>
        ) : producto === null ? (
          <p className="mt-10 text-sm text-graphite-muted">Producto no encontrado.</p>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-12 md:grid-cols-2">
            <Carrusel producto={producto} />

            <div>
              <h1 className="font-serif text-3xl font-medium text-white">{producto.nombre}</h1>
              {producto.subtitulo && (
                <p className="mt-2 text-[11px] uppercase tracking-widest2 text-bronze">
                  {producto.subtitulo}
                </p>
              )}
              {producto.descripcionCorta && (
                <p className="mt-6 text-sm leading-relaxed text-white">
                  {producto.descripcionCorta}
                </p>
              )}
              {producto.descripcionLarga && (
                <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-graphite-muted">
                  {producto.descripcionLarga}
                </p>
              )}
            </div>
          </div>
        )}
      </section>

      <SiteFooter />
    </div>
  );
}

/** Carrusel: una imagen visible, flechas + miniaturas para cambiar. */
function Carrusel({ producto }: { producto: Producto }) {
  const imagenes = [producto.imagenPrincipal, ...producto.imagenesGaleria].filter(
    Boolean,
  ) as string[];
  const [indice, setIndice] = useState(0);

  if (imagenes.length === 0) {
    return (
      <div className="flex h-[420px] items-center justify-center bg-graphite-tile text-xs text-graphite-muted">
        Sin imágenes
      </div>
    );
  }

  return (
    <div>
      <div className="relative h-[420px] bg-graphite-tile">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imagenes[indice]}
          alt={`${producto.nombre} — imagen ${indice + 1} de ${imagenes.length}`}
          className="h-full w-full object-cover"
        />
        {imagenes.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => setIndice((i) => (i - 1 + imagenes.length) % imagenes.length)}
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-black/40 to-transparent px-3 text-2xl text-white/70 hover:text-white"
              title="Anterior"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => setIndice((i) => (i + 1) % imagenes.length)}
              className="absolute right-0 top-0 h-full bg-gradient-to-l from-black/40 to-transparent px-3 text-2xl text-white/70 hover:text-white"
              title="Siguiente"
            >
              ›
            </button>
            <p className="absolute bottom-3 right-3 bg-black/60 px-2 py-0.5 text-[10px] text-white">
              {indice + 1} / {imagenes.length}
            </p>
          </>
        )}
      </div>

      {imagenes.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {imagenes.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setIndice(i)}
              className={`h-16 w-16 flex-shrink-0 border ${
                i === indice ? 'border-bronze' : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
