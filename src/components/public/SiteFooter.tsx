/** Footer — fondo negro (obsidiana), 4 columnas: marca, productos, empresa, contacto. */
export function SiteFooter() {
  return (
    <>
      <footer className="grid grid-cols-1 gap-8 border-t border-graphite-border bg-obsidian px-8 py-12 md:grid-cols-4 md:px-12">
        <div>
          <svg width="24" height="24" viewBox="0 0 56 56" className="mb-3" aria-hidden>
            <polyline points="0,0 0,56 56,56" fill="none" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <polyline points="0,0 28,26 56,0" fill="none" stroke="#C8A96E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p className="mb-2 font-serif text-sm tracking-widest2 text-white">MIRAIA</p>
          <p className="text-[11px] leading-relaxed text-graphite-muted">
            Superficies de autor
            <br />
            para arquitectura contract.
          </p>
        </div>

        <div>
          <p className="mb-4 text-[10px] uppercase tracking-wide text-bronze">Productos</p>
          <FooterLink>Piso técnico</FooterLink>
          <FooterLink>Alfombra modular</FooterLink>
          <FooterLink>Vinílico LVT</FooterLink>
          <FooterLink>Catálogo completo</FooterLink>
        </div>

        <div>
          <p className="mb-4 text-[10px] uppercase tracking-wide text-bronze">Empresa</p>
          <FooterLink>Nosotros</FooterLink>
          <FooterLink>Proyectos</FooterLink>
          <FooterLink>Showroom</FooterLink>
          <FooterLink>Contacto</FooterLink>
        </div>

        <div>
          <p className="mb-4 text-[10px] uppercase tracking-wide text-bronze">Contacto</p>
          <FooterLink>Buenos Aires, CABA</FooterLink>
          <FooterLink>info@miraia.com.ar</FooterLink>
          <FooterLink>WhatsApp comercial</FooterLink>
          <FooterLink>LinkedIn</FooterLink>
        </div>
      </footer>

      <div className="flex items-center justify-between border-t border-graphite bg-obsidian px-8 py-4 md:px-12">
        <p className="text-[11px] tracking-wide text-graphite-border">
          © {new Date().getFullYear()} MIRAIA — Surfaces &amp; Contract.
        </p>
      </div>
    </>
  );
}

function FooterLink({ children }: { children: React.ReactNode }) {
  return <a className="mb-2 block text-xs tracking-wide text-graphite-muted hover:text-bronze">{children}</a>;
}
