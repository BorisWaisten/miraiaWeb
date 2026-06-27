import Link from 'next/link';
import type { Proyecto } from '@/models/proyecto';

interface Props {
  proyectos: Proyecto[];
}

/** Sección "Proyectos realizados" — fondo marfil, layout asimétrico 2:1. */
export function Projects({ proyectos }: Props) {
  const principal = proyectos.find((p) => p.esPrincipal) ?? proyectos[0];
  const secundarios = proyectos.filter((p) => p.id !== principal?.id).slice(0, 2);

  return (
    <section id="proyectos" className="bg-ivory px-8 py-16 text-obsidian md:px-12">
      <div className="mb-12 flex items-end justify-between">
        <h2 className="font-serif text-2xl font-medium text-obsidian md:text-[28px]">Proyectos realizados</h2>
        <Link href="/#proyectos" className="text-[11px] uppercase tracking-wide text-bronze">
          Ver todos los proyectos →
        </Link>
      </div>

      {principal && (
        <div className="grid grid-cols-1 gap-px bg-mist md:grid-cols-[2fr_1fr]">
          <div className="flex h-[300px] flex-col justify-end bg-[#E8E6DF] p-8">
            <p className="mb-1.5 text-[10px] uppercase tracking-wide text-graphite-muted">{principal.etiqueta}</p>
            <p className="font-serif text-lg text-obsidian">{principal.nombre}</p>
          </div>

          <div className="flex flex-col gap-px">
            {secundarios.map((p, i) => (
              <div
                key={p.id}
                className="flex flex-1 flex-col justify-end p-5"
                style={{ backgroundColor: i === 0 ? '#DEDCD5' : '#D3D1C7' }}
              >
                <p className="mb-1.5 text-[10px] uppercase tracking-wide text-graphite-muted">{p.etiqueta}</p>
                <p className="font-serif text-sm text-obsidian">{p.nombre}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
