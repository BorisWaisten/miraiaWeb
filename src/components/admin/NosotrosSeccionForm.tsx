'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { apiSendJson } from '@/lib/api';
import type { SeccionNosotros } from '@/models/nosotros';

interface Props {
  seccion?: SeccionNosotros; // si viene, el form opera en modo "editar"
}

/** Formulario de alta/edición de sección de la página /nosotros/. */
export function NosotrosSeccionForm({ seccion }: Props) {
  const router = useRouter();
  const esEdicion = Boolean(seccion);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [titulo, setTitulo] = useState(seccion?.titulo ?? '');
  const [subtitulo, setSubtitulo] = useState(seccion?.subtitulo ?? '');
  const [body, setBody] = useState(seccion?.body ?? '');
  const [imagenUrl, setImagenUrl] = useState(seccion?.imagenUrl ?? '');
  const [orden, setOrden] = useState(seccion?.orden ?? 0);
  const [activo, setActivo] = useState(seccion?.activo ?? true);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const datos = { titulo, subtitulo, body, imagenUrl, orden, activo };
    const path = esEdicion ? `/admin/nosotros-seccion.php?id=${seccion!.id}` : '/admin/nosotros-secciones.php';
    const res = await apiSendJson(path, datos);

    if (!res.ok) {
      setError(res.error ?? 'No se pudo guardar la sección.');
      setLoading(false);
      return;
    }

    router.push('/admin/nosotros/');
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <Field label="Título">
        <input
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          required
          minLength={2}
          maxLength={220}
          className="w-full border border-graphite-border bg-transparent px-4 py-2.5 text-sm text-white outline-none focus:border-bronze"
        />
      </Field>

      <Field label="Subtítulo (opcional)">
        <input
          value={subtitulo}
          onChange={(e) => setSubtitulo(e.target.value)}
          maxLength={280}
          className="w-full border border-graphite-border bg-transparent px-4 py-2.5 text-sm text-white outline-none focus:border-bronze"
        />
      </Field>

      <Field label="Imagen (opcional — URL, ej. de Cloudinary)">
        <input
          value={imagenUrl}
          onChange={(e) => setImagenUrl(e.target.value)}
          placeholder="https://res.cloudinary.com/..."
          className="w-full border border-graphite-border bg-transparent px-4 py-2.5 text-sm text-white placeholder-graphite-muted outline-none focus:border-bronze"
        />
        {imagenUrl.trim() !== '' && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imagenUrl} alt="" className="mt-3 h-32 w-auto border border-graphite-border object-cover" />
        )}
      </Field>

      <Field label="Cuerpo">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
          minLength={10}
          rows={10}
          className="w-full border border-graphite-border bg-transparent px-4 py-2.5 text-sm text-white outline-none focus:border-bronze"
        />
      </Field>

      <Field label="Orden (menor primero)">
        <input
          type="number"
          value={orden}
          onChange={(e) => setOrden(Number(e.target.value))}
          min={0}
          className="w-32 border border-graphite-border bg-transparent px-4 py-2.5 text-sm text-white outline-none focus:border-bronze"
        />
      </Field>

      <Field label="Activa (visible al público)">
        <input
          type="checkbox"
          checked={activo}
          onChange={(e) => setActivo(e.target.checked)}
          className="accent-[#C8A96E]"
        />
      </Field>

      {error && <p className="text-xs text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="bg-bronze px-7 py-3 text-[11px] uppercase tracking-wide text-obsidian disabled:opacity-60"
      >
        {loading ? 'Guardando…' : esEdicion ? 'Guardar cambios' : 'Crear sección'}
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
