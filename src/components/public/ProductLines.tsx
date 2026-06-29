import Link from 'next/link';
import type { Producto } from '@/models/producto';

interface Props {
  productos: Producto[];
}

/**
 * Sección "Líneas de producto" — grid de 3 cards con separadores de 1px.
 * SIN precios: solo catálogo, nombre y descripción corta.
 */
export function ProductLines({ productos }: Props) {
  return (
    <section className="px-8 py-16 md:px-12">
      <div className="mb-12 flex items-end justify-between">
        <h2 className="font-serif text-2xl font-medium text-white md:text-[28px]">Líneas de producto</h2>
        <Link href="/productos/" className="text-[11px] uppercase tracking-wide text-bronze">
          Ver catálogo completo →
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-px bg-graphite-border md:grid-cols-3">
        {productos.map((producto) => (
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
                <div className="flex h-full items-center justify-center text-graphite-muted text-xs">
                  Sin imagen
                </div>
              )}
            </div>
            <div className="px-6 py-5">
              <p className="mb-2 text-[10px] uppercase tracking-wide text-bronze">
                {producto.catalogoNombre}
              </p>
              <p className="mb-1.5 font-serif text-base text-white">{producto.nombre}</p>
              <p className="text-xs leading-relaxed text-graphite-muted">{producto.descripcionCorta}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
