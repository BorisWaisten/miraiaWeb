'use client';

import { useEffect, useState } from 'react';
import { SiteNav } from '@/components/public/SiteNav';
import { SiteFooter } from '@/components/public/SiteFooter';
import { cldOptimizar } from '@/lib/cloudinary';
import { apiGet } from '@/lib/api';
import type { Proyecto } from '@/models/proyecto';

/**
 * Listado completo de "Proyectos realizados" — la sección del home solo
 * muestra la card principal + 2 (layout 2:1), acá va el catálogo entero,
 * mismo patrón que /productos/ respecto de la teaser ProductLines del home.
 */
export default function ProyectosPage() {
  const [proyectos, setProyectos] = useState<Proyecto[] | null>(null);

  useEffect(() => {
    apiGet<Proyecto[]>('/proyectos.php?limite=100').then((res) => setProyectos(res.data ?? []));
  }, []);

  return (
    <div className="bg-graphite">
      <SiteNav />

      <main className="px-8 py-16 md:px-12">
        <div className="mb-10">
          <p className="mb-3 text-[10px] uppercase tracking-widest2 text-bronze">Proyectos</p>
          <h1 className="font-serif text-3xl font-medium text-white">
            Alfombras Modulares y Piso Técnico Instalados en Proyectos Reales
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-graphite-muted">
            Oficinas corporativas, coworkings, recepciones y data centers en Buenos Aires
            equipados con nuestras alfombras modulares y piso técnico.
          </p>
        </div>

        {proyectos === null ? (
          <p className="text-sm text-graphite-muted">Cargando…</p>
        ) : proyectos.length === 0 ? (
          <p className="text-sm text-graphite-muted">No hay proyectos cargados por el momento.</p>
        ) : (
          <div className="grid grid-cols-1 gap-px bg-graphite-border sm:grid-cols-2 md:grid-cols-3">
            {proyectos.map((proyecto) => (
              <ProyectoCard key={proyecto.id} proyecto={proyecto} />
            ))}
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}

function ProyectoCard({ proyecto }: { proyecto: Proyecto }) {
  return (
    <div className="bg-graphite">
      <div className="relative h-[220px] bg-graphite-tile">
        {proyecto.imagen ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cldOptimizar(proyecto.imagen, 700)}
            alt={proyecto.nombre}
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
        <p className="text-[10px] uppercase tracking-widest2 text-graphite-muted">{proyecto.etiqueta}</p>
        <p className="mt-1.5 font-serif text-lg text-white">{proyecto.nombre}</p>
        {proyecto.cliente && <p className="mt-1.5 text-[12px] text-bronze">{proyecto.cliente}</p>}
      </div>
    </div>
  );
}
