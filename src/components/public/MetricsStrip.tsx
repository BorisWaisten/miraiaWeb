const METRICAS = [
  { num: '+200', label: 'SKUs disponibles\npara entrega inmediata' },
  { num: 'B2B', label: 'Atención directa\na arquitectos y estudios' },
  { num: '48h', label: 'Tiempo de respuesta\npara presupuestos' },
  { num: 'CABA', label: 'Showroom y depósito\ncon stock disponible' },
] as const;

/** Strip de métricas de confianza B2B — franja horizontal con separadores verticales. */
export function MetricsStrip() {
  return (
    <div className="flex flex-col border-y border-graphite-border md:flex-row">
      {METRICAS.map((m, i) => (
        <div
          key={m.num}
          className={`flex flex-1 items-center gap-3 px-6 py-5 ${
            i < METRICAS.length - 1 ? 'border-b border-graphite-border md:border-b-0 md:border-r' : ''
          }`}
        >
          <span className="font-serif text-[22px] font-medium text-bronze">{m.num}</span>
          <span className="text-[11px] leading-relaxed tracking-wide text-graphite-muted whitespace-pre-line">
            {m.label}
          </span>
        </div>
      ))}
    </div>
  );
}
