import Link from 'next/link';
import { cldOptimizar } from '@/lib/cloudinary';
import { LINEAS, urlProducto, type Producto } from '@/models/producto';

interface Props {
  productos: Producto[];
}

/**
 * Sección "Alfombras Modulares para Cada Proyecto" — fondo marfil. Muestra
 * exactamente los productos recibidos, en el orden recibido: la selección y
 * el orden son responsabilidad de quien arma `productos` (home.tsx fija los
 * 6 productos curados por el cliente).
 */
export function ProductLines({ productos }: Props) {
  return (
    <section className="bg-ivory px-8 py-16 text-obsidian md:px-12">
      <p className="mb-2 text-[9px] uppercase tracking-widest2 text-bronze">
        Alfombras modulares · Piso técnico
      </p>
      <div className="mb-2 flex flex-col items-start justify-between gap-2 md:flex-row md:items-end">
        <h2 className="font-serif text-2xl font-medium text-obsidian md:text-[28px]">
          Alfombras Modulares para Cada Proyecto
        </h2>
        <Link href="/productos/" className="text-[11px] uppercase tracking-wide text-bronze">
          Ver catálogo completo →
        </Link>
      </div>
      <p className="mb-10 max-w-[560px] text-[13px] leading-relaxed text-cement">
        Baldosas de alfombra modular de alto tránsito, piso técnico elevado y vinílico LVT para
        oficinas corporativas, call centers, data centers y proyectos contract. Certificación ISO
        9001 y normas internacionales de seguridad al fuego.
      </p>

      <div className="grid grid-cols-1 gap-px bg-mist sm:grid-cols-2 md:grid-cols-3">
        {productos.map((producto) => (
          <Link key={producto.id} href={urlProducto(producto)} className="block bg-white transition-opacity hover:opacity-90">
            <div className="relative h-[180px] bg-graphite-tile">
              {producto.imagenPrincipal ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={cldOptimizar(producto.imagenPrincipal, 700)}
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
            <div className="px-5 py-4">
              <p className="mb-1 text-[9px] uppercase tracking-widest2 text-bronze">
                {LINEAS[producto.linea]?.etiqueta ?? LINEAS['alfombra-modular'].etiqueta}
              </p>
              <p className="mb-1 text-[13px] font-medium text-obsidian">{producto.nombre}</p>
              {producto.descripcionCorta && (
                <p className="line-clamp-2 text-[11px] leading-relaxed text-cement">
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
