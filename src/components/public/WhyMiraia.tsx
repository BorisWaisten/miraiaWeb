const RAZONES = [
  {
    icon: IconBuilding,
    titulo: 'Stock permanente de alfombra modular en Buenos Aires',
    desc: 'Depósito propio en CABA. Baldosas de alfombra modular disponibles para entrega inmediata sin tiempos de importación.',
  },
  {
    icon: IconUsers,
    titulo: 'Atención directa a arquitectos sin intermediarios',
    desc: 'Presupuesto técnico en 48 horas. Especificaciones completas para proyectos contract de alfombra de alto tránsito y piso técnico.',
  },
  {
    icon: IconCertificate,
    titulo: 'Certificación ISO 9001 · ASTM · Ignifugación Clase I',
    desc: 'Toda la línea de alfombras modulares cumple normas internacionales de seguridad al fuego, bajas emisiones y resistencia para alto tránsito.',
  },
  {
    icon: IconReplace,
    titulo: 'Reposición individual de baldosas de alfombra',
    desc: 'Sistema modular que permite reemplazar piezas dañadas sin rehacer el piso. Ideal para oficinas, call centers y pasillos de alto tránsito.',
  },
] as const;

/** Sección "Por qué Miraia" — fondo grafito, grilla 2x2 de razones B2B. */
export function WhyMiraia() {
  return (
    <section className="bg-graphite px-8 py-16 md:px-12">
      <p className="mb-3 text-[10px] uppercase tracking-widest2 text-bronze">Por qué Miraia</p>
      <h2 className="font-serif text-2xl font-medium text-white md:text-[28px]">
        Especialistas en alfombras modulares y piso técnico para oficinas
      </h2>
      <p className="mt-4 max-w-[560px] text-[13px] leading-relaxed text-graphite-muted">
        Proveedor directo de alfombras de alto tránsito y piso técnico elevado para arquitectos,
        constructoras y estudios de diseño en Buenos Aires.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-px bg-graphite-border sm:grid-cols-2">
        {RAZONES.map((r) => (
          <div key={r.titulo} className="bg-graphite p-7">
            <r.icon className="mb-4 h-6 w-6 text-bronze" />
            <p className="mb-2 text-[13px] font-medium text-white">{r.titulo}</p>
            <p className="text-[12px] leading-relaxed text-graphite-muted">{r.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

type IconProps = { className?: string };

function IconBuilding({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className} aria-hidden>
      <rect x="4" y="3" width="12" height="18" />
      <path d="M16 8h4v13h-4" />
      <path d="M7.5 7h1M11.5 7h1M7.5 11h1M11.5 11h1M7.5 15h1M11.5 15h1" strokeLinecap="round" />
    </svg>
  );
}

function IconUsers({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className} aria-hidden>
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 20c0-3.038 2.462-5.5 5.5-5.5s5.5 2.462 5.5 5.5" strokeLinecap="round" />
      <circle cx="17" cy="8.5" r="2.4" />
      <path d="M15.8 14.8c2.6.3 4.7 2.5 4.7 5.2" strokeLinecap="round" />
    </svg>
  );
}

function IconCertificate({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className} aria-hidden>
      <circle cx="12" cy="9" r="6" />
      <path d="M9.5 8.7l1.7 1.7 3.3-3.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 14.2L7.5 21l4.5-2.2L16.5 21l-1.5-6.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconReplace({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className} aria-hidden>
      <path d="M4 12a8 8 0 0 1 13.3-6" strokeLinecap="round" />
      <path d="M17.3 3v4h-4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20 12a8 8 0 0 1-13.3 6" strokeLinecap="round" />
      <path d="M6.7 21v-4h4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
