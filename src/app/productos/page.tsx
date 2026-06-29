'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { SiteNav } from '@/components/public/SiteNav';
import { SiteFooter } from '@/components/public/SiteFooter';
import { apiGet } from '@/lib/api';
import type { Producto } from '@/models/producto';
import type { Catalogo } from '@/models/catalogo';

/** Catálogo completo, filtrable por catálogo dinámico. Vista de exhibición — sin precios. */
export default function CatalogoPage() {
  const [productos, setProductos] = useState<Producto[] | null>(null);
  const [catalogos, setCatalogos] = useState<Catalogo[]>([]);
  const [filtroSlug, setFiltroSlug] = useState<string | null>(null);

  // Lee el filtro desde el query param ?catalogo=<slug>
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setFiltroSlug(params.get('catalogo'));
  }, []);

  // Carga catálogos activos para los chips de filtro
  useEffect(() => {
    apiGet<Catalogo[]>('/admin/catalogos.php').then((res) => {
      // El endpoint de admin requiere sesión; usamos los catálogos que vienen
      // embebidos en los productos si falla, o podemos agregar un endpoint público.
      // Por ahora cargamos catálogos únicos desde los propios productos cargados.
    });
  }, []);

  useEffect(() => {
    apiGet<Producto[]>('/productos.php').then((res) => {
      if (!res.data) return;
      setProductos(res.data);
      // Extraer catálogos únicos de los productos recibidos
      const mapa = new Map<string, Catalogo>();
      for (const p of res.data) {
        if (!mapa.has(p.catalogoSlug)) {
          mapa.set(p.catalogoSlug, {
            id: p.catalogoId,
            slug: p.catalogoSlug,
            nombre: p.catalogoNombre,
            descripcion: null,
            activo: true,
            orden: 0,
            totalProductos: 0,
            createdAt: '',
            updatedAt: '',
          });
        }
      }
      setCatalogos(Array.from(mapa.values()));
    });
  }, []);

  const productosFiltrados = filtroSlug
    ? (productos ?? []).filter((p) => p.catalogoSlug === filtroSlug)
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
            activo={!filtroSlug}
            onClick={() => setFiltroSlug(null)}
            href="/productos/"
          />
          {catalogos.map((c) => (
            <FiltroChip
              key={c.slug}
              label={c.nombre}
              activo={filtroSlug === c.slug}
              onClick={() => setFiltroSlug(c.slug)}
              href={`/productos/?catalogo=${c.slug}`}
            />
          ))}
        </div>

        {productos === null ? (
          <p className="text-sm text-graphite-muted">Cargando…</p>
        ) : productosFiltrados.length === 0 ? (
          <p className="text-sm text-graphite-muted">
            No hay productos disponibles en esta línea por el momento.
          </p>
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
                    {producto.catalogoNombre}
                  </p>
                  <p className="mb-1.5 font-serif text-base text-white">{producto.nombre}</p>
                  <p className="text-xs leading-relaxed text-graphite-muted">
                    {producto.descripcionCorta}
                  </p>
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
        activo
          ? 'bg-bronze text-obsidian'
          : 'border border-graphite-border text-graphite-muted hover:text-white'
      }`}
    >
      {label}
    </Link>
  );
}
