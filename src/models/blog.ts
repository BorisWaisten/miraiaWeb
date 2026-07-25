/**
 * Modelo de dominio "BlogPost" (migración 009).
 * `categoria` es texto libre que carga el admin (no una tabla relacional
 * como `categorias` de productos) — el listado agrupa por lo que haya.
 * `contenido` es texto plano con una convención simple, NUNCA HTML:
 *   "## Subtítulo"  → subtítulo
 *   "- ítem"        → lista (líneas consecutivas que empiezan con "- ")
 *   "**texto**"     → negrita, en cualquier parte de un párrafo o ítem
 * Sin imágenes en el cuerpo — el compilado del cliente es todo texto.
 *
 * Coincide 1:1 con BlogPosts::mapRow() en php-api/lib/BlogPosts.php.
 */
export interface BlogPost {
  id: number;
  slug: string;
  titulo: string;
  categoria: string | null;
  resumen: string | null;
  contenido: string;
  imagenPortada: string | null;
  publicado: boolean;
  destacado: boolean;
  orden: number;
  createdAt: string;
  updatedAt: string;
}

export function urlBlogPost(p: Pick<BlogPost, 'slug'>): string {
  return `/blog/${p.slug}/`;
}

export type BloqueContenido =
  | { tipo: 'subtitulo'; texto: string }
  | { tipo: 'lista'; items: string[] }
  | { tipo: 'parrafo'; texto: string };

/** Parsea `contenido` (bloques separados por línea en blanco) a una lista estructurada. */
export function parseContenidoBlog(texto: string | null | undefined): BloqueContenido[] {
  const bloques = (texto ?? '').replace(/\r\n/g, '\n').split(/\n{2,}/);
  const resultado: BloqueContenido[] = [];

  for (const bloqueRaw of bloques) {
    const bloque = bloqueRaw.trim();
    if (bloque === '') continue;

    if (bloque.startsWith('## ')) {
      resultado.push({ tipo: 'subtitulo', texto: bloque.slice(3).trim() });
      continue;
    }

    const lineas = bloque.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lineas.length > 0 && lineas.every((l) => l.startsWith('- '))) {
      resultado.push({ tipo: 'lista', items: lineas.map((l) => l.slice(2).trim()) });
      continue;
    }

    resultado.push({ tipo: 'parrafo', texto: bloque });
  }

  return resultado;
}

/** Divide un texto en segmentos {negrita} respetando "**...**" — texto plano, nunca HTML. */
export function parseTextoConNegrita(texto: string): { negrita: boolean; texto: string }[] {
  return texto
    .split(/(\*\*[^*]+\*\*)/g)
    .filter((s) => s !== '')
    .map((s) =>
      s.startsWith('**') && s.endsWith('**')
        ? { negrita: true, texto: s.slice(2, -2) }
        : { negrita: false, texto: s },
    );
}
