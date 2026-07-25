import type { Metadata } from 'next';
import { SiteNav } from '@/components/public/SiteNav';
import { SiteFooter } from '@/components/public/SiteFooter';
import { ContactoForm } from '@/components/public/ContactoForm';

export const metadata: Metadata = {
  title: 'Contacto — Consultas y Presupuestos | Miraia',
  description:
    'Escribinos por WhatsApp para una consulta general o para pedir presupuesto de alfombras modulares y piso técnico. Atención directa a arquitectos y estudios.',
  alternates: { canonical: '/contacto/' },
};

export default function ContactoPage() {
  return (
    <div className="bg-graphite">
      <SiteNav />
      <section className="px-8 py-16 md:px-12">
        <div className="mx-auto max-w-xl">
          <p className="mb-3 text-[10px] uppercase tracking-widest2 text-bronze">Contacto</p>
          <h1 className="font-serif text-3xl font-medium text-white">Hablemos por WhatsApp</h1>
          <p className="mt-4 text-sm leading-relaxed text-graphite-muted">
            Elegí si querés hacer una consulta general o pedir presupuesto — te respondemos
            directo por WhatsApp.
          </p>
          <ContactoForm />
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
