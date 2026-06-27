import Link from 'next/link';

/** Hero — grid 1fr/1fr, texto + textura de producto. Replica el layout del HTML de referencia. */
export function Hero() {
  const tiles = Array.from({ length: 30 });

  return (
    <div className="grid min-h-[480px] grid-cols-1 md:grid-cols-2">
      <div className="flex flex-col justify-between border-b border-graphite-border px-8 py-16 md:border-b-0 md:border-r md:px-12">
        <div>
          <p className="mb-8 text-[10px] uppercase tracking-widest2 text-bronze">
            Piso técnico · Alfombra modular
          </p>
          <h1 className="mb-6 font-serif text-4xl font-medium leading-tight text-white md:text-[42px]">
            Superficies
            <br />
            que definen
            <br />
            espacios.
          </h1>
          <p className="mb-10 max-w-[340px] text-[13px] leading-7 text-graphite-muted">
            Materiales de alto rendimiento para arquitectura contract, oficinas y espacios de trabajo de autor.
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="/productos/"
              className="bg-bronze px-7 py-3 text-[11px] uppercase tracking-wide text-obsidian"
            >
              Ver productos
            </Link>
            <Link href="/#proyectos" className="text-[11px] uppercase tracking-wide text-graphite-muted hover:text-white">
              Ver proyectos →
            </Link>
          </div>
        </div>
      </div>

      <div className="relative flex items-center justify-center overflow-hidden bg-graphite-tile">
        <div className="grid h-full w-full grid-cols-6 grid-rows-5 gap-px">
          {tiles.map((_, i) => {
            const isThird = (i + 1) % 3 === 0;
            const isFifth = (i + 1) % 5 === 0;
            const isSeventh = (i + 1) % 7 === 0;
            const bg = isThird ? '#282826' : isFifth ? '#1e1e1c' : isSeventh ? '#2a2a28' : '#222220';
            return <div key={i} style={{ backgroundColor: bg }} />;
          })}
        </div>
        <div className="absolute bottom-8 left-8 text-[10px] uppercase tracking-wide text-graphite-muted">
          Colección 2025 — Contract series
        </div>
      </div>
    </div>
  );
}
