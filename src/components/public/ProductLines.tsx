import Link from 'next/link';
import { urlProducto, type Producto } from '@/models/producto';

interface Props {
  productos: Producto[];
}

/**
 * Sección "Series" — grid de 3 cards con separadores de 1px.
 * Cada card sigue la jerarquía del Manual: Título (serif) → Subtítulo
 * (uppercase espaciado) → Cuerpo (descripción corta). Sin precios.
 */
export function ProductLines({ productos }: Props) {
  return (
    <section className="px-8 py-16 md:px-12">
      <div className="mb-12 flex items-end justify-between">
        <h2 className="font-serif text-2xl font-medium text-white md:text-[28px]">Series</h2>
        <Link href="/productos/" className="text-[11px] uppercase tracking-wide text-bronze">
          Ver todos los productos →
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-px bg-graphite-border md:grid-cols-3">
        {productos.map((producto) => (
          <Link
            key={producto.id}
            href={urlProducto(producto)}
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
    </section>
  );
}
