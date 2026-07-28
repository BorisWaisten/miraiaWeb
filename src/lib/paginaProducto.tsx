import type { Metadata } from 'next';
import { SiteNav } from '@/components/public/SiteNav';
import { SiteFooter } from '@/components/public/SiteFooter';
import { ProductoDetalle } from '@/components/public/ProductoDetalle';
import { getProductosBuild, SITE_URL } from '@/lib/seo';
import { LINEAS, urlProducto, type LineaProducto } from '@/models/producto';

/**
 * Fábrica de la página estática de detalle de producto, parametrizada por
 * línea de negocio. Cada ruta (/alfombras-modulares/[slug]/ y
 * /pisos-tecnicos/[slug]/) es un archivo de 5 líneas que re-exporta esto.
 * Title, meta, canonical y JSON-LD quedan horneados en el HTML del build.
 */
export function crearPaginaProducto(linea: LineaProducto) {
  const { etiqueta } = LINEAS[linea];

  // `?? 'alfombra-modular'`: si el build corre contra una API sin migración
  // 005 (sin campo linea), los productos caen en alfombras y no desaparecen.
  const deLinea = async () =>
    (await getProductosBuild()).filter((p) => (p.linea ?? 'alfombra-modular') === linea);

  async function generateStaticParams() {
    const slugs = (await deLinea()).map((p) => ({ slug: p.slug }));
    // output:export no permite un array vacío — si la línea aún no tiene
    // productos se genera un placeholder noindex que nadie linkea.
    return slugs.length > 0 ? slugs : [{ slug: '_' }];
  }

  async function generateMetadata({
    params,
  }: {
    params: Promise<{ slug: string }>;
  }): Promise<Metadata> {
    const { slug } = await params;
    const producto = (await deLinea()).find((p) => p.slug === slug);
    if (!producto) return { title: 'Miraia', robots: { index: false } };

    // Patrón del doc SEO (ítem 01): "Nombre — Subtítulo | Miraia"
    const titulo = `${producto.nombre} — ${producto.subtitulo ?? etiqueta} | Miraia`;
    const descripcion = producto.descripcionCorta ?? producto.subtitulo ?? undefined;
    const url = urlProducto(producto);
    // `new URL(ruta, SITE_URL)` deja pasar imagenPrincipal absoluta (Cloudinary) tal cual.
    const imagen = producto.imagenPrincipal ? new URL(producto.imagenPrincipal, SITE_URL).href : undefined;

    return {
      title: titulo,
      description: descripcion,
      alternates: { canonical: url },
      // Ítem 05 del doc SEO: sin esto, compartir un producto (WhatsApp, LinkedIn)
      // mostraba la imagen y el texto del home en vez de los del producto.
      openGraph: {
        title: titulo,
        description: descripcion,
        url,
        siteName: 'Miraia',
        images: imagen ? [{ url: imagen, width: 1200, height: 630, alt: producto.nombre }] : undefined,
        locale: 'es_AR',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: titulo,
        description: descripcion,
        images: imagen ? [imagen] : undefined,
      },
    };
  }

  async function PaginaProducto({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const producto = (await deLinea()).find((p) => p.slug === slug);

    if (!producto) {
      // Placeholder de línea vacía — nunca linkeado, noindex.
      return (
        <div className="bg-graphite">
          <SiteNav />
          <section className="px-8 py-16 md:px-12">
            <p className="text-sm text-graphite-muted">Próximamente.</p>
          </section>
          <SiteFooter />
        </div>
      );
    }

    const abs = (ruta: string) => new URL(ruta, SITE_URL).href;

    // Ítems 13 y 14 del doc SEO: schema Product + BreadcrumbList (JSON-LD)
    const jsonLd = [
      {
        '@context': 'https://schema.org/',
        '@type': 'Product',
        name: `${producto.nombre} — ${producto.subtitulo ?? etiqueta}`,
        brand: { '@type': 'Brand', name: 'Miraia' },
        category: etiqueta,
        ...(producto.descripcionCorta && { description: producto.descripcionCorta }),
        ...(producto.imagenPrincipal && { image: abs(producto.imagenPrincipal) }),
      },
      {
        '@context': 'https://schema.org/',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Inicio', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Productos', item: abs('/productos/') },
          { '@type': 'ListItem', position: 3, name: producto.nombre, item: abs(urlProducto(producto)) },
        ],
      },
    ];

    return (
      <div className="bg-graphite">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <SiteNav />
        <section className="px-8 py-16 md:px-12">
          <ProductoDetalle producto={producto} />
        </section>
        <SiteFooter />
      </div>
    );
  }

  return { generateStaticParams, generateMetadata, PaginaProducto };
}
