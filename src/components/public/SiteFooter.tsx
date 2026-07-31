import { whatsappUrl } from '@/lib/contacto';

/** Footer — fondo negro (obsidiana), 3 columnas: marca, productos, contacto. */
export function SiteFooter() {
  return (
    <>
      <footer className="grid grid-cols-1 gap-8 border-t border-graphite-border bg-obsidian px-8 py-12 md:grid-cols-3 md:px-12">
        <div>
          <svg width="24" height="24" viewBox="0 0 56 56" className="mb-3" aria-hidden>
            <polyline points="0,0 0,56 56,56" fill="none" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <polyline points="0,0 28,26 56,0" fill="none" stroke="#C8A96E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p className="mb-2 font-serif text-sm tracking-widest2 text-white">MIRAIA</p>
          <p className="text-[11px] leading-relaxed text-graphite-muted">
            Alfombras modulares y piso técnico
            <br />
            para arquitectura contract.
          </p>
        </div>

        <div>
          <p className="mb-4 text-[10px] uppercase tracking-wide text-bronze">Productos</p>
          <FooterLink href="/productos/">Alfombras modulares</FooterLink>
          <FooterLink href="/productos/">Baldosas de alfombra</FooterLink>
          <FooterLink href="/productos/">Piso técnico elevado</FooterLink>
          <FooterLink href="/productos/">Cloudstory Nylon</FooterLink>
        </div>

        <div>
          <p className="mb-4 text-[10px] uppercase tracking-wide text-bronze">Contacto</p>
          <FooterLink>Buenos Aires, CABA</FooterLink>
          <FooterLink href="mailto:info@miraia.com.ar">info@miraia.com.ar</FooterLink>
          <FooterLink href={whatsappUrl()} target="_blank">
            WhatsApp comercial
          </FooterLink>
          <FooterLink>LinkedIn</FooterLink>
        </div>
      </footer>

      <div className="flex flex-col gap-1.5 border-t border-graphite bg-obsidian px-8 py-4 sm:flex-row sm:items-center sm:justify-between md:px-12">
        <p className="text-[11px] tracking-wide text-graphite-border">
          © {new Date().getFullYear()} Miraia. Todos los derechos reservados.
        </p>
        <p className="text-[11px] tracking-wide text-graphite-border">miraia.com.ar</p>
      </div>
    </>
  );
}

function FooterLink({
  children,
  href,
  target,
}: {
  children: React.ReactNode;
  href?: string;
  target?: string;
}) {
  return (
    <a
      href={href}
      target={target}
      rel={target === '_blank' ? 'noopener noreferrer' : undefined}
      className="mb-2 block text-xs tracking-wide text-graphite-muted hover:text-bronze"
    >
      {children}
    </a>
  );
}
