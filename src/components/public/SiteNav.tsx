'use client';

import Link from 'next/link';
import { useState } from 'react';

const LINKS = [
  { href: '/productos/', label: 'Productos' },
  { href: '/#proyectos', label: 'Proyectos' },
  { href: '/blog/', label: 'Blog' },
  { href: '/nosotros/', label: 'Nosotros' },
  { href: '/contacto/', label: 'Contacto' },
] as const;

/** Navegación principal — fiel al HTML de referencia (fondo grafito, separador inferior). */
export function SiteNav() {
  const [abierto, setAbierto] = useState(false);

  return (
    <nav className="border-b border-graphite-border px-6 py-5 md:px-12 md:py-6">
      <div className="flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3.5" onClick={() => setAbierto(false)}>
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
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="text-xs uppercase tracking-wide text-graphite-muted hover:text-bronze">
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/contacto/"
            className="hidden border border-bronze px-5 py-2 text-[11px] uppercase tracking-wide text-bronze transition-colors hover:bg-bronze hover:text-obsidian md:inline-block"
          >
            Solicitar catálogo
          </Link>

          {/* Hamburguesa — reemplaza al nav + CTA de arriba por debajo de md */}
          <button
            type="button"
            onClick={() => setAbierto((v) => !v)}
            aria-label={abierto ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={abierto}
            className="flex h-9 w-9 flex-col items-center justify-center gap-[5px] md:hidden"
          >
            <span
              className={`block h-px w-6 bg-white transition-transform duration-200 ${abierto ? 'translate-y-[6.5px] rotate-45' : ''}`}
            />
            <span className={`block h-px w-6 bg-white transition-opacity duration-200 ${abierto ? 'opacity-0' : ''}`} />
            <span
              className={`block h-px w-6 bg-white transition-transform duration-200 ${abierto ? '-translate-y-[6.5px] -rotate-45' : ''}`}
            />
          </button>
        </div>
      </div>

      {/* Panel mobile — mismos links que el nav de desktop + CTA, apilados */}
      {abierto && (
        <div className="mt-5 flex flex-col border-t border-graphite-border pt-2 md:hidden">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setAbierto(false)}
              className="border-b border-graphite-border py-3.5 text-sm uppercase tracking-wide text-graphite-muted hover:text-bronze"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/contacto/"
            onClick={() => setAbierto(false)}
            className="mt-5 border border-bronze px-5 py-3 text-center text-[11px] uppercase tracking-wide text-bronze"
          >
            Solicitar catálogo
          </Link>
        </div>
      )}
    </nav>
  );
}
