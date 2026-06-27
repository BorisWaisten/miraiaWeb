'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { SiteNav } from '@/components/public/SiteNav';
import { SiteFooter } from '@/components/public/SiteFooter';
import { apiGet } from '@/lib/api';
import { CATEGORIAS_PRODUCTO, CATEGORIA_LABEL, type Producto, type CategoriaProducto } from '@/models/producto';

/** Catálogo completo, filtrable por línea de producto. Vista de exhibición — sin precios. */
export default function CatalogoPage() {
  const [productos, setProductos] = useState<Producto[] | null>(null);
  const [categoriaFiltro, setCategoriaFiltro] = useState<CategoriaProducto | null>(null);

  // El filtro viaje por query string (?categoria=...) para que los links del
  // home/footer puedan apuntar directo a una línea — se lee del lado del cliente
  // porque el sitio es estático (sin Server Components ni searchParams de servidor).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get('categoria') as CategoriaProducto | null;
    setCategoriaFiltro(cat && CATEGORIAS_PRODUCTO.includes(cat) ? cat : null);
  }, []);

  useEffect(() => {
    apiGet<Producto[]>('/productos.php').then((res) => setProductos(res.data ?? []));
  }, []);

  const productosFiltrados = categoriaFiltro
    ? (productos ?? []).filter((p) => p.categoria === categoriaFiltro)
    : productos ?? [];

  return (
    <div className="bg-graphite">
      <SiteNav />

      <section className="px-8 py-16 md:px-12">
        <div className="mb-10">
          <p className="mb-3 text-[10px] uppercase tracking-widest2 text-bronze">Catálogo</p>
          <h1 className="font-serif text-3xl font-medium text-white">Líneas de producto</h1>
        </div>

        <div className="mb-10 flex flex-wrap gap-3">
          <FiltroChip
            label="Todas"
            activo={!categoriaFiltro}
            onClick={() => setCategoriaFiltro(null)}
            href="/productos/"
          />
          {CATEGORIAS_PRODUCTO.map((cat) => (
            <FiltroChip
              key={cat}
              label={CATEGORIA_LABEL[cat]}
              activo={categoriaFiltro === cat}
              onClick={() => setCategoriaFiltro(cat)}
              href={`/productos/?categoria=${cat}`}
            />
          ))}
        </div>

        {productos === null ? (
          <p className="text-sm text-graphite-muted">Cargando…</p>
        ) : productosFiltrados.length === 0 ? (
          <p className="text-sm text-graphite-muted">No hay productos disponibles en esta línea por el momento.</p>
        ) : (
          <div className="grid grid-cols-1 gap-px bg-graphite-border sm:grid-cols-2 md:grid-cols-3">
            {productosFiltrados.map((producto) => (
              <Link
                key={producto.id}
                href={`/productos/ver/?slug=${producto.slug}`}
                className="block bg-graphite transition-opacity hover:opacity-90"
              >
                <div className="relative h-[200px] bg-graphite-tile">
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
                  <p className="mb-2 text-[10px] uppercase tracking-wide text-bronze">
                    {CATEGORIA_LABEL[producto.categoria]}
                  </p>
                  <p className="mb-1.5 font-serif text-base text-white">{producto.nombre}</p>
                  <p className="text-xs leading-relaxed text-graphite-muted">{producto.descripcionCorta}</p>
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

function FiltroChip({
  href,
  label,
  activo,
  onClick,
}: {
  href: string;
  label: string;
  activo: boolean;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`px-4 py-2 text-[11px] uppercase tracking-wide ${
        activo ? 'bg-bronze text-obsidian' : 'border border-graphite-border text-graphite-muted hover:text-white'
      }`}
    >
      {label}
    </Link>
  );
}
