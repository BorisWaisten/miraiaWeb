'use client';

import { useEffect, useState } from 'react';
import { SiteNav } from '@/components/public/SiteNav';
import { Hero } from '@/components/public/Hero';
import { MetricsStrip } from '@/components/public/MetricsStrip';
import { ProductLines } from '@/components/public/ProductLines';
import { Projects } from '@/components/public/Projects';
import { SiteFooter } from '@/components/public/SiteFooter';
import { apiGet } from '@/lib/api';
import type { Producto } from '@/models/producto';
import type { Proyecto } from '@/models/proyecto';

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
  const destacados = todos.filter((p) => p.destacado).slice(0, 3);
  const productosHome = destacados.length > 0 ? destacados : todos.slice(0, 3);

  return (
    <div className="bg-graphite">
      <SiteNav />
      <main>
        <Hero />
        <MetricsStrip />
        {productos !== null && <ProductLines productos={productosHome} />}
        {proyectos !== null && proyectos.length > 0 && <Projects proyectos={proyectos} />}
      </main>
      <SiteFooter />
    </div>
  );
}
