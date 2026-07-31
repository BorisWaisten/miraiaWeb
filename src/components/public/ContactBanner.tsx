import { CRM_URL, whatsappUrl } from '@/lib/contacto';

/** Franja marfil de cierre — CTA de contacto B2B (presupuesto + WhatsApp). */
export function ContactBanner() {
  return (
    <section className="bg-ivory px-8 py-14 text-center md:px-12">
      <p className="mb-2.5 text-[10px] uppercase tracking-widest2 text-bronze">Contacto B2B</p>
      <h2 className="mx-auto max-w-xl font-serif text-xl font-medium text-obsidian md:text-2xl">
        Presupuesto de alfombra modular o piso técnico para tu proyecto
      </h2>
      <p className="mx-auto mt-3 max-w-md text-[13px] leading-relaxed text-cement">
        Showroom en Buenos Aires · Atención directa a arquitectos, constructoras y estudios de
        diseño
      </p>
      <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <a href={CRM_URL} className="bg-obsidian px-7 py-3 text-[11px] uppercase tracking-wide text-white">
          Solicitar presupuesto
        </a>
        <a
          href={whatsappUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="border border-obsidian px-7 py-3 text-[11px] uppercase tracking-wide text-obsidian"
        >
          WhatsApp comercial
        </a>
      </div>
    </section>
  );
}
