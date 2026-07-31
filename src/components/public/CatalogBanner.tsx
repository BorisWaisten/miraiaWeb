import { CRM_URL } from '@/lib/contacto';

/** Franja CTA bronce entre "Productos" y "Por qué Miraia" — copy SEO del cliente. */
export function CatalogBanner() {
  return (
    <section className="flex flex-col items-start gap-5 bg-bronze px-8 py-8 md:flex-row md:items-center md:justify-between md:px-12">
      <p className="max-w-[420px] font-serif text-base font-medium leading-snug text-obsidian md:text-lg">
        ¿Estás especificando alfombras modulares o piso técnico para un proyecto? Solicitá el
        catálogo técnico y te respondemos en 48h.
      </p>
      <a
        href={CRM_URL}
        className="flex-shrink-0 whitespace-nowrap border border-obsidian px-5 py-2.5 text-[11px] uppercase tracking-wide text-obsidian"
      >
        Solicitar catálogo técnico
      </a>
    </section>
  );
}
