'use client';

import { useEffect, useState } from 'react';
import { SiteNav } from '@/components/public/SiteNav';
import { SiteFooter } from '@/components/public/SiteFooter';
import { apiGet } from '@/lib/api';
import type { SeccionNosotros } from '@/models/nosotros';

/** Texto original — se muestra mientras el admin no cargó ninguna sección en /admin/nosotros/. */
const CONTENIDO_ORIGINAL = [
  'Miraia nace de dos raíces: el latín miranda — "la que debe ser admirada" — y una raíz tupí-guaraní que evoca el agua y la tierra. Juntas forman una palabra que no existe en ningún idioma. Ese es el punto de partida de la marca: superficies que no pasan desapercibidas.',
  'Nos especializamos en alfombras modulares y pisos técnicos para proyectos de arquitectura contract: oficinas corporativas, hoteles, recepciones, salas de reuniones y espacios de alto tránsito donde el material define la experiencia del espacio.',
  'Todos nuestros productos se fabrican bajo normas internacionales de seguridad al fuego, con bajas emisiones certificadas y gestión de calidad ISO 9001. Trabajamos con stock en Buenos Aires y atención directa a arquitectos y estudios, con catálogo técnico y presupuesto en 48h.',
];

export default function NosotrosPage() {
  const [secciones, setSecciones] = useState<SeccionNosotros[] | null>(null);

  useEffect(() => {
    apiGet<SeccionNosotros[]>('/nosotros.php').then((res) => setSecciones(res.data ?? []));
  }, []);

  const hayContenidoCargado = (secciones?.length ?? 0) > 0;

  return (
    <div className="bg-graphite">
      <SiteNav />
      <section className="px-8 py-16 md:px-12">
        <div className="mx-auto max-w-2xl">
          <p className="mb-3 text-[10px] uppercase tracking-widest2 text-bronze">Nosotros</p>
          <h1 className="font-serif text-3xl font-medium text-white md:text-4xl">
            Superficies de autor para arquitectura contract.
          </h1>

          {hayContenidoCargado ? (
            <div className="mt-10 space-y-12">
              {secciones!.map((s) => (
                <SeccionBloque key={s.id} seccion={s} />
              ))}
            </div>
          ) : (
            <div className="mt-8 space-y-6 text-sm leading-relaxed text-graphite-muted">
              {CONTENIDO_ORIGINAL.map((parrafo, i) => (
                <p key={i}>{parrafo}</p>
              ))}
            </div>
          )}

          <a
            href="/contacto/"
            className="mt-10 inline-block border border-bronze px-7 py-3 text-[11px] uppercase tracking-widest2 text-bronze transition-colors hover:bg-bronze hover:text-obsidian"
          >
            Solicitar catálogo
          </a>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}

/**
 * Bloque de una sección cargada desde el admin. Sin `imagenUrl` no se
 * renderiza ningún contenedor de imagen — no ocupa espacio de una imagen vacía.
 */
function SeccionBloque({ seccion }: { seccion: SeccionNosotros }) {
  return (
    <div>
      <h2 className="font-serif text-xl font-medium text-white md:text-2xl">{seccion.titulo}</h2>
      {seccion.subtitulo && (
        <p className="mt-1.5 text-sm text-bronze">{seccion.subtitulo}</p>
      )}
      {seccion.imagenUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={seccion.imagenUrl}
          alt={seccion.titulo}
          className="mt-5 w-full object-cover"
          loading="lazy"
        />
      )}
      <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-graphite-muted">
        {seccion.body}
      </p>
    </div>
  );
}
