'use client';

import Link from 'next/link';

/** Hero de portada — foto de fondo full-bleed con overlay para legibilidad del texto. */
export function Hero() {
  return (
    <div className="relative flex min-h-[600px] items-center overflow-hidden border-b border-graphite-border px-6 py-24 md:h-[78vh] md:min-h-[640px] md:max-h-[840px] md:px-12">
      <picture>
        <source media="(max-width: 767px)" srcSet="/images/hero-bg-mobile.jpg" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/hero-bg.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-[75%_30%] md:object-[65%_35%]"
        />
      </picture>

      {/* Overlay: oscurece la izquierda para que el texto quede legible sobre la foto */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(90deg, rgba(17,17,17,0.92) 0%, rgba(17,17,17,0.72) 32%, rgba(17,17,17,0.25) 60%, rgba(17,17,17,0.15) 100%), linear-gradient(0deg, rgba(17,17,17,0.55) 0%, rgba(17,17,17,0.15) 35%, rgba(17,17,17,0.15) 100%)',
        }}
      />

      <div className="relative max-w-xl">
        <p className="mb-8 text-[10px] uppercase tracking-widest2 text-bronze">
          Piso técnico · Alfombra modular
        </p>
        <h1 className="mb-6 font-serif text-[30px] font-medium leading-tight text-white md:text-[44px]">
          Alfombras Modulares y{' '}
          <br className="hidden md:inline" />
          Piso Técnico para{' '}
          <br className="hidden md:inline" />
          Arquitectura Contract
        </h1>
        <p className="mb-10 max-w-[400px] text-[13px] leading-7 text-graphite-muted">
          Materiales de alto rendimiento para arquitectura contract, oficinas y espacios de trabajo de autor.
        </p>
        <div className="flex items-center gap-4">
          <Link href="/productos/" className="bg-bronze px-7 py-3 text-[11px] uppercase tracking-wide text-obsidian">
            Ver productos
          </Link>
          <Link href="/#proyectos" className="text-[11px] uppercase tracking-wide text-white hover:text-bronze">
            Ver proyectos →
          </Link>
        </div>
      </div>
    </div>
  );
}
