'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { apiGet, apiSendJson } from '@/lib/api';
import type { BlogPost } from '@/models/blog';

interface Props {
  post?: BlogPost; // si viene, el form opera en modo "editar"
}

// Categorías del compilado original del cliente — sugeridas en el datalist,
// pero el campo es texto libre: el admin puede escribir cualquier otra.
const CATEGORIAS_SUGERIDAS = [
  'Comparativas / Decisión de compra',
  'Mantenimiento y durabilidad',
  'Diseño y especificación',
];

/**
 * Formulario de alta/edición de posteo de blog.
 * Sin upload de archivos — todo JSON, incluida la imagen de portada (URL).
 * `contenido` usa una convención de texto plano simple, no HTML/Markdown de
 * terceros (ver src/models/blog.ts): "## " subtítulo, "- " lista, "**" negrita.
 */
export function BlogPostForm({ post }: Props) {
  const router = useRouter();
  const esEdicion = Boolean(post);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [titulo, setTitulo] = useState(post?.titulo ?? '');
  const [categoria, setCategoria] = useState(post?.categoria ?? '');
  const [resumen, setResumen] = useState(post?.resumen ?? '');
  const [imagenPortada, setImagenPortada] = useState(post?.imagenPortada ?? '');
  const [contenido, setContenido] = useState(post?.contenido ?? '');
  const [publicado, setPublicado] = useState(post?.publicado ?? true);
  const [destacado, setDestacado] = useState(post?.destacado ?? false);

  const [categoriasExistentes, setCategoriasExistentes] = useState<string[]>([]);
  useEffect(() => {
    apiGet<BlogPost[]>('/admin/blog-posts.php').then((res) => {
      const existentes = (res.data ?? []).map((p) => p.categoria).filter((c): c is string => Boolean(c));
      setCategoriasExistentes([...new Set(existentes)]);
    });
  }, []);
  const sugerencias = [...new Set([...CATEGORIAS_SUGERIDAS, ...categoriasExistentes])];

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const datos = { titulo, categoria, resumen, imagenPortada, contenido, publicado, destacado };
    const path = esEdicion ? `/admin/blog-post.php?id=${post!.id}` : '/admin/blog-posts.php';
    const res = await apiSendJson(path, datos);

    if (!res.ok) {
      setError(res.error ?? 'No se pudo guardar el posteo.');
      setLoading(false);
      return;
    }

    router.push('/admin/blog/');
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <Field label="Título">
        <input
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          required
          minLength={4}
          maxLength={220}
          className="w-full border border-graphite-border bg-transparent px-4 py-2.5 text-sm text-white outline-none focus:border-bronze"
        />
      </Field>

      <Field label="Categoría (opcional — texto libre)">
        <input
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          list="categorias-blog-sugeridas"
          maxLength={120}
          placeholder="Ej. Mantenimiento y durabilidad"
          className="w-full border border-graphite-border bg-transparent px-4 py-2.5 text-sm text-white placeholder-graphite-muted outline-none focus:border-bronze"
        />
        <datalist id="categorias-blog-sugeridas">
          {sugerencias.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </Field>

      <Field label="Resumen (opcional — se muestra en el listado)">
        <input
          value={resumen}
          onChange={(e) => setResumen(e.target.value)}
          maxLength={400}
          className="w-full border border-graphite-border bg-transparent px-4 py-2.5 text-sm text-white outline-none focus:border-bronze"
        />
      </Field>

      <Field label="Imagen de portada (opcional — URL, ej. de Cloudinary)">
        <input
          value={imagenPortada}
          onChange={(e) => setImagenPortada(e.target.value)}
          placeholder="https://res.cloudinary.com/..."
          className="w-full border border-graphite-border bg-transparent px-4 py-2.5 text-sm text-white placeholder-graphite-muted outline-none focus:border-bronze"
        />
      </Field>

      <Field
        label={
          'Contenido — texto plano: "## " para subtítulo, "- " para ítem de lista, "**texto**" para negrita'
        }
      >
        <textarea
          value={contenido}
          onChange={(e) => setContenido(e.target.value)}
          required
          minLength={10}
          rows={18}
          placeholder={
            'La decisión parece simple, pero define el resto de la obra.\n\n## Lo que realmente inclina la balanza\n\n- **Mantenimiento por sector.** El rollo exige intervenir superficies completas.\n- **Logística de obra.** Los módulos se transportan con stock disponible.'
          }
          className="w-full border border-graphite-border bg-transparent px-4 py-2.5 font-mono text-sm text-white placeholder-graphite-muted outline-none focus:border-bronze"
        />
      </Field>

      <div className="flex gap-6">
        <Field label="Publicado (visible al público)">
          <input
            type="checkbox"
            checked={publicado}
            onChange={(e) => setPublicado(e.target.checked)}
            className="accent-[#C8A96E]"
          />
        </Field>
        <Field label="Destacado">
          <input
            type="checkbox"
            checked={destacado}
            onChange={(e) => setDestacado(e.target.checked)}
            className="accent-[#C8A96E]"
          />
        </Field>
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="bg-bronze px-7 py-3 text-[11px] uppercase tracking-wide text-obsidian disabled:opacity-60"
      >
        {loading ? 'Guardando…' : esEdicion ? 'Guardar cambios' : 'Publicar posteo'}
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] uppercase tracking-wide text-graphite-muted">
        {label}
      </label>
      {children}
    </div>
  );
}
