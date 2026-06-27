import Link from 'next/link';
import type { Producto } from '@/models/producto';
import { CATEGORIA_LABEL } from '@/models/producto';

interface Props {
  productos: Producto[];
}

/**
 * Sección "Líneas de producto" — grid de 3 cards con separadores de 1px,
 * tal como en el HTML de referencia. SIN precios: solo categoría, nombre y descripción corta.
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
            {/*
              Imagen servida como archivo ESTÁTICO real desde public_html/uploads/productos
              (fuera del build de Next). Se usa <img> nativo en vez de next/image: el
              optimizador de next/image espera archivos dentro de /public al momento del
              build/arranque, y esta carpeta vive fuera del build y cambia en runtime vía
              el panel de admin — un <img> directo es más simple y confiable en SiteGround.
            */}
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
                {CATEGORIA_LABEL[producto.categoria]}
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
