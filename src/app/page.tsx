'use client';

import { useEffect, useState } from 'react';
import { SiteNav } from '@/components/public/SiteNav';
import { Hero } from '@/components/public/Hero';
import { MetricsStrip } from '@/components/public/MetricsStrip';
import { ProductLines } from '@/components/public/ProductLines';
import { CatalogBanner } from '@/components/public/CatalogBanner';
import { WhyMiraia } from '@/components/public/WhyMiraia';
import { Projects } from '@/components/public/Projects';
import { ContactBanner } from '@/components/public/ContactBanner';
import { SiteFooter } from '@/components/public/SiteFooter';
import { apiGet } from '@/lib/api';
import type { Producto } from '@/models/producto';
import type { Proyecto } from '@/models/proyecto';

// Selección curada del cliente para la grilla de productos del home — estos
// 6 slugs y este orden exacto (5 alfombras + Piso Autoposante al cierre),
// tal cual el mockup SEO final. No depende del flag "destacado" ni del
// orden de la API: si un slug no existe en el catálogo, se omite sin más.
const PRODUCTOS_HOME = ['alba', 'vega', 'cauce', 'vienna', 'rubi', 'piso-autoposante'];

/**
 * Home — sitio 100% estático (output: 'export'), así que los datos del
 * catálogo y de proyectos se piden a la API PHP del lado del cliente,
 * no hay Server Components con acceso directo a la base.
 */
export default function HomePage() {
  const [productos, setProductos] = useState<Producto[] | null>(null);
  const [proyectos, setProyectos] = useState<Proyecto[] | null>(null);

  useEffect(() => {
    apiGet<Producto[]>('/productos.php').then((res) => setProductos(res.data ?? []));
    apiGet<Proyecto[]>('/proyectos.php').then((res) => setProyectos(res.data ?? []));
  }, []);

  const todos = productos ?? [];
  const productosHome = PRODUCTOS_HOME.map((slug) => todos.find((p) => p.slug === slug)).filter(
    (p): p is Producto => p !== undefined,
  );

  return (
    <div className="bg-graphite">
      <SiteNav />
      <main>
        <Hero />
        <MetricsStrip />
        {productos !== null && <ProductLines productos={productosHome} />}
        <CatalogBanner />
        <WhyMiraia />
        {proyectos !== null && proyectos.length > 0 && <Projects proyectos={proyectos} />}
        <ContactBanner />
      </main>
      <SiteFooter />
    </div>
  );
}
