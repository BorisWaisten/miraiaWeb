import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SiteNav } from '@/components/public/SiteNav';
import { SiteFooter } from '@/components/public/SiteFooter';
import { BlogPostDetalle } from '@/components/public/BlogPostDetalle';
import { getBlogPostsBuild, SITE_URL } from '@/lib/seo';
import { urlBlogPost } from '@/models/blog';

/**
 * Detalle de posteo — estático, mismo patrón que /alfombras-modulares/[slug]/
 * (ver src/lib/paginaProducto.tsx). Sin "líneas" acá: el blog es un solo
 * namespace de URL, no hace falta la fábrica parametrizada de productos.
 *
 * `dynamicParams = true` (default): posteos creados después del build se
 * renderizan on-demand en Vercel, en vez de dar 404 hasta el próximo deploy.
 */
export const dynamicParams = true;

export async function generateStaticParams() {
  const slugs = (await getBlogPostsBuild()).map((p) => ({ slug: p.slug }));
  // output:export no permite un array vacío — sin posteos se genera un
  // placeholder noindex que nadie linkea.
  return slugs.length > 0 ? slugs : [{ slug: '_' }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = (await getBlogPostsBuild()).find((p) => p.slug === slug);
  if (!post) return { title: 'Miraia', robots: { index: false } };
  return {
    title: `${post.titulo} | Blog Miraia`,
    description: post.resumen ?? undefined,
    alternates: { canonical: urlBlogPost(post) },
  };
}

export default async function PaginaBlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = (await getBlogPostsBuild()).find((p) => p.slug === slug);

  if (!post) notFound();

  const abs = (ruta: string) => new URL(ruta, SITE_URL).href;

  const jsonLd = [
    {
      '@context': 'https://schema.org/',
      '@type': 'Article',
      headline: post.titulo,
      ...(post.resumen && { description: post.resumen }),
      ...(post.imagenPortada && { image: post.imagenPortada }),
      datePublished: post.createdAt,
      dateModified: post.updatedAt,
      author: { '@type': 'Organization', name: 'Miraia' },
      publisher: { '@type': 'Organization', name: 'Miraia' },
    },
    {
      '@context': 'https://schema.org/',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Inicio', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: abs('/blog/') },
        { '@type': 'ListItem', position: 3, name: post.titulo, item: abs(urlBlogPost(post)) },
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
      <main className="px-8 py-16 md:px-12">
        <BlogPostDetalle post={post} />
      </main>
      <SiteFooter />
    </div>
  );
}
