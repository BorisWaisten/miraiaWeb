import Link from 'next/link';

/** Navegación principal — fiel al HTML de referencia (fondo grafito, separador inferior). */
export function SiteNav() {
  return (
    <nav className="flex items-center justify-between border-b border-graphite-border px-12 py-6">
      <Link href="/" className="flex items-center gap-3.5">
        <svg width="22" height="22" viewBox="0 0 56 56" aria-hidden>
          <polyline
            points="0,0 0,56 56,56"
            fill="none"
            stroke="#ffffff"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <polyline
            points="0,0 28,26 56,0"
            fill="none"
            stroke="#C8A96E"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="font-serif text-base font-medium tracking-widest3 text-white">MIRAIA</span>
      </Link>

      <div className="hidden gap-8 md:flex">
        <Link href="/productos/" className="text-xs uppercase tracking-wide text-graphite-muted hover:text-bronze">
          Productos
        </Link>
        <Link href="/#proyectos" className="text-xs uppercase tracking-wide text-graphite-muted hover:text-bronze">
          Proyectos
        </Link>
        <Link href="/nosotros/" className="text-xs uppercase tracking-wide text-graphite-muted hover:text-bronze">
          Nosotros
        </Link>
        <Link href="/contacto/" className="text-xs uppercase tracking-wide text-graphite-muted hover:text-bronze">
          Contacto
        </Link>
      </div>

      <Link
        href="/contacto/"
        className="border border-bronze px-5 py-2 text-[11px] uppercase tracking-wide text-bronze hover:bg-bronze hover:text-obsidian transition-colors"
      >
        Solicitar catálogo
      </Link>
    </nav>
  );
}
