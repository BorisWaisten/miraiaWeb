import Link from 'next/link';
import { parseContenidoBlog, parseTextoConNegrita, type BlogPost } from '@/models/blog';

/**
 * Detalle de posteo de blog — UI compartida entre la página estática
 * /blog/[slug]/ (SEO, datos en el HTML del build) y el fallback client-side
 * /blog/ver/ (posteos creados post-build). Mismo patrón que ProductoDetalle.
 */
export function BlogPostDetalle({ post }: { post: BlogPost }) {
  const bloques = parseContenidoBlog(post.contenido);
  const fecha = new Date(post.createdAt).toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <article>
      <nav aria-label="Breadcrumb" className="text-[11px] uppercase tracking-wide text-graphite-muted">
        <Link href="/" className="hover:text-bronze">Inicio</Link>
        <span className="mx-2">›</span>
        <Link href="/blog/" className="hover:text-bronze">Blog</Link>
        <span className="mx-2">›</span>
        <span className="text-bronze">{post.titulo}</span>
      </nav>

      <div className="mx-auto mt-8 max-w-3xl">
        {post.categoria && (
          <p className="mb-3 text-[10px] uppercase tracking-widest2 text-bronze">{post.categoria}</p>
        )}
        <h1 className="font-serif text-3xl font-medium leading-tight text-white md:text-4xl">
          {post.titulo}
        </h1>
        <p className="mt-3 text-[11px] uppercase tracking-wide text-graphite-muted">{fecha}</p>

        {post.resumen && (
          <p className="mt-6 text-base leading-relaxed text-ivory">{post.resumen}</p>
        )}

        {post.imagenPortada && (
          <div className="mt-8 h-[320px] bg-graphite-tile md:h-[420px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.imagenPortada}
              alt={post.titulo}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        <div className="mt-10 space-y-5">
          {bloques.map((bloque, i) => {
            if (bloque.tipo === 'subtitulo') {
              return (
                <h2 key={i} className="pt-4 font-serif text-xl font-medium text-white">
                  {bloque.texto}
                </h2>
              );
            }
            if (bloque.tipo === 'lista') {
              return (
                <ul key={i} className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-graphite-muted">
                  {bloque.items.map((item, j) => (
                    <li key={j}>
                      <TextoConNegrita texto={item} />
                    </li>
                  ))}
                </ul>
              );
            }
            return (
              <p key={i} className="text-sm leading-relaxed text-graphite-muted">
                <TextoConNegrita texto={bloque.texto} />
              </p>
            );
          })}
        </div>

        <p className="mt-12 border-t border-graphite-border pt-6 text-[11px] italic text-graphite-muted">
          Miraia Surfaces &amp; Contract — Superficies de autor para arquitectura contract.
        </p>
      </div>
    </article>
  );
}

/** Renderiza `**negrita**` sin HTML — split de texto plano en segmentos. */
function TextoConNegrita({ texto }: { texto: string }) {
  return (
    <>
      {parseTextoConNegrita(texto).map((seg, i) =>
        seg.negrita ? (
          <strong key={i} className="font-semibold text-ivory">
            {seg.texto}
          </strong>
        ) : (
          <span key={i}>{seg.texto}</span>
        ),
      )}
    </>
  );
}
