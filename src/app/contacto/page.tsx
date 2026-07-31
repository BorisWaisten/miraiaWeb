import type { Metadata } from 'next';
import { SiteNav } from '@/components/public/SiteNav';
import { SiteFooter } from '@/components/public/SiteFooter';
import { RedirectToCRM } from '@/components/public/RedirectToCRM';

// Contacto y presupuesto ahora se manejan desde el CRM del cliente
// (miraia3.netlify.app) — esta ruta solo existe para no romper links/bookmarks
// viejos a /contacto/, por eso queda fuera del sitemap y sin indexar.
export const metadata: Metadata = {
  title: 'Contacto | Miraia',
  robots: { index: false, follow: false },
};

export default function ContactoPage() {
  return (
    <div className="bg-graphite">
      <SiteNav />
      <main className="flex min-h-[40vh] items-center justify-center px-8 py-16 md:px-12">
        <RedirectToCRM />
      </main>
      <SiteFooter />
    </div>
  );
}
