import type { Metadata } from 'next';
import { SiteNav } from '@/components/public/SiteNav';
import { SiteFooter } from '@/components/public/SiteFooter';

export const metadata: Metadata = {
  title: 'Nosotros — Superficies de Autor para Arquitectura Contract | Miraia',
  description:
    'Miraia es una marca premium de superficies para arquitectura contract: alfombras modulares y pisos técnicos con certificación internacional. Buenos Aires.',
  alternates: { canonical: '/nosotros/' },
};

export default function NosotrosPage() {
  return (
    <div className="bg-graphite">
      <SiteNav />
      <section className="px-8 py-16 md:px-12">
        <div className="mx-auto max-w-2xl">
          <p className="mb-3 text-[10px] uppercase tracking-widest2 text-bronze">Nosotros</p>
          <h1 className="font-serif text-3xl font-medium text-white md:text-4xl">
            Superficies de autor para arquitectura contract.
          </h1>

          <div className="mt-8 space-y-6 text-sm leading-relaxed text-graphite-muted">
            <p>
              Miraia nace de dos raíces: el latín <em>miranda</em> — &ldquo;la que debe ser
              admirada&rdquo; — y una raíz tupí-guaraní que evoca el agua y la tierra. Juntas
              forman una palabra que no existe en ningún idioma. Ese es el punto de partida de
              la marca: superficies que no pasan desapercibidas.
            </p>
            <p>
              Nos especializamos en alfombras modulares y pisos técnicos para proyectos de
              arquitectura contract: oficinas corporativas, hoteles, recepciones, salas de
              reuniones y espacios de alto tránsito donde el material define la experiencia
              del espacio.
            </p>
            <p>
              Todos nuestros productos se fabrican bajo normas internacionales de seguridad al
              fuego, con bajas emisiones certificadas y gestión de calidad ISO 9001. Trabajamos
              con stock en Buenos Aires y atención directa a arquitectos y estudios, con
              catálogo técnico y presupuesto en 48h.
            </p>
          </div>

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
