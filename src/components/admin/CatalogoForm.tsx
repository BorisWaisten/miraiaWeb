'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, type FormEvent } from 'react';
import { apiSendJson } from '@/lib/api';
import type { Catalogo } from '@/models/catalogo';

interface Props {
  catalogo?: Catalogo; // si viene, modo edición
}

function slugify(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // quita acentos
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

export function CatalogoForm({ catalogo }: Props) {
  const router = useRouter();
  const esEdicion = Boolean(catalogo);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [nombre, setNombre] = useState(catalogo?.nombre ?? '');
  const [slug, setSlug] = useState(catalogo?.slug ?? '');
  const [slugManual, setSlugManual] = useState(esEdicion); // en edición el slug no se autogenera
  const [descripcion, setDescripcion] = useState(catalogo?.descripcion ?? '');
  const [activo, setActivo] = useState(catalogo?.activo ?? true);

  // Autogenerar slug desde nombre (solo cuando no fue editado manualmente)
  useEffect(() => {
    if (!slugManual) {
      setSlug(slugify(nombre));
    }
  }, [nombre, slugManual]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const body = { nombre, slug, descripcion: descripcion || null, activo };
    const path = esEdicion
      ? `/admin/catalogo.php?id=${catalogo!.id}`
      : '/admin/catalogos.php';

    const res = await apiSendJson(path, body, 'POST');

    if (!res.ok) {
      setError(res.error ?? 'No se pudo guardar el catálogo.');
      setLoading(false);
      return;
    }

    router.push('/admin/catalogos/');
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-6">
      <Field label="Nombre">
        <input
          required
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="w-full border border-graphite-border bg-transparent px-4 py-2.5 text-sm text-white outline-none focus:border-bronze"
        />
      </Field>

      <Field label="Slug (URL)">
        <div className="flex gap-2">
          <input
            required
            value={slug}
            onChange={(e) => { setSlugManual(true); setSlug(e.target.value.replace(/[^a-z0-9_-]/g, '')); }}
            className="w-full border border-graphite-border bg-transparent px-4 py-2.5 font-mono text-sm text-white outline-none focus:border-bronze"
          />
          {slugManual && (
            <button
              type="button"
              onClick={() => { setSlugManual(false); setSlug(slugify(nombre)); }}
              className="whitespace-nowrap border border-graphite-border px-3 py-2 text-[10px] uppercase tracking-wide text-graphite-muted hover:text-bronze"
            >
              Auto
            </button>
          )}
        </div>
        <p className="mt-1 text-[11px] text-graphite-muted">
          Se usa para filtrar el catálogo público: <span className="text-white">/productos/?catalogo={slug || '…'}</span>
        </p>
      </Field>

      <Field label="Descripción corta (opcional)">
        <textarea
          rows={2}
          maxLength={500}
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          className="w-full border border-graphite-border bg-transparent px-4 py-2.5 text-sm text-white outline-none focus:border-bronze"
        />
      </Field>

      <Field label="Activo (visible en el catálogo público)">
        <label className="flex cursor-pointer items-center gap-3">
          <div
            onClick={() => setActivo(!activo)}
            className={`relative h-5 w-9 rounded-full transition-colors ${activo ? 'bg-bronze' : 'bg-graphite-border'}`}
          >
            <span
              className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${activo ? 'translate-x-4' : 'translate-x-0.5'}`}
            />
          </div>
          <span className="text-sm text-graphite-muted">{activo ? 'Activo' : 'Inactivo'}</span>
        </label>
      </Field>

      {error && <p className="text-xs text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="bg-bronze px-7 py-3 text-[11px] uppercase tracking-wide text-obsidian disabled:opacity-60"
      >
        {loading ? 'Guardando…' : esEdicion ? 'Guardar cambios' : 'Crear catálogo'}
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] uppercase tracking-wide text-graphite-muted">{label}</label>
      {children}
    </div>
  );
}
