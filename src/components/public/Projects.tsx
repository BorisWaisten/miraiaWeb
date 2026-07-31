import Link from 'next/link';
import { cldOptimizar } from '@/lib/cloudinary';
import type { Proyecto } from '@/models/proyecto';

interface Props {
  proyectos: Proyecto[];
}

/** Sección "Proyectos realizados" — fondo negro, layout asimétrico 2:1. */
export function Projects({ proyectos }: Props) {
  const principal = proyectos.find((p) => p.esPrincipal) ?? proyectos[0];
  const secundarios = proyectos.filter((p) => p.id !== principal?.id).slice(0, 2);

  return (
    <section id="proyectos" className="bg-obsidian px-8 py-16 md:px-12">
      <p className="mb-2 text-[9px] uppercase tracking-widest2 text-bronze">Proyectos realizados</p>
      <div className="mb-2 flex flex-col items-start justify-between gap-2 md:flex-row md:items-end">
        <h2 className="font-serif text-2xl font-medium text-white md:text-[28px]">
          Alfombras modulares y piso técnico instalados en proyectos reales
        </h2>
        <Link href="/proyectos/" className="text-[11px] uppercase tracking-wide text-bronze">
          Ver todos →
        </Link>
      </div>
      <p className="mb-10 max-w-[560px] text-[13px] leading-relaxed text-graphite-muted">
        Proyectos de alfombra modular de alto tránsito, piso técnico elevado y revestimientos
        para oficinas corporativas, coworkings y data centers en Buenos Aires.
      </p>

      {principal && (
        <div className="grid grid-cols-1 gap-px bg-graphite-border md:grid-cols-[2fr_1fr]">
          <ProyectoTile proyecto={principal} className="h-[300px] p-8" fallbackColor="#141412" />

          <div className="flex flex-col gap-px">
            {secundarios.map((p, i) => (
              <ProyectoTile
                key={p.id}
                proyecto={p}
                className="flex-1 p-5"
                fallbackColor={i === 0 ? '#1a1a18' : '#161614'}
                compacto
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function ProyectoTile({
  proyecto,
  className,
  fallbackColor,
  compacto = false,
}: {
  proyecto: Proyecto;
  className: string;
  fallbackColor: string;
  compacto?: boolean;
}) {
  return (
    <div
      className={`relative flex flex-col justify-end overflow-hidden ${className}`}
      style={proyecto.imagen ? undefined : { backgroundColor: fallbackColor }}
    >
      {proyecto.imagen && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={cldOptimizar(proyecto.imagen, 900)}
            alt={proyecto.nombre}
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        </>
      )}

      <div className="relative">
        <p className="mb-1.5 text-[10px] uppercase tracking-wide text-graphite-muted">{proyecto.etiqueta}</p>
        <p className={`font-serif text-white ${compacto ? 'text-sm' : 'text-lg'}`}>{proyecto.nombre}</p>
        {proyecto.cliente && <p className="mt-1 text-[11px] text-bronze">{proyecto.cliente}</p>}
      </div>
    </div>
  );
}
