'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, type FormEvent } from 'react';
import { apiSendForm, apiGet } from '@/lib/api';
import type { Producto } from '@/models/producto';
import type { Catalogo } from '@/models/catalogo';
import { RichTextEditor } from '@/components/admin/RichTextEditor';

interface Props {
  producto?: Producto; // si viene, el form opera en modo "editar"
}

/**
 * Formulario de alta/edición de producto.
 * — Categoría: dropdown cargado dinámicamente desde /admin/catalogos.php
 * — Descripción larga: editor Tiptap (HTML limpio)
 * — Imágenes: hasta 3 slots (imagen_1 principal, imagen_2, imagen_3 opcionales)
 */
export function ProductForm({ producto }: Props) {
  const router = useRouter();
  const esEdicion = Boolean(producto);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // — Catálogos dinámicos —
  const [catalogos, setCatalogos] = useState<Catalogo[]>([]);
  useEffect(() => {
    apiGet<Catalogo[]>('/admin/catalogos.php').then((res) => {
      if (res.ok && res.data) setCatalogos(res.data.filter((c) => c.activo));
    });
  }, []);

  // — Imágenes —
  const [previews, setPreviews] = useState<[string | null, string | null, string | null]>([
    producto?.imagenPrincipal ?? null,
    producto?.imagenesGaleria?.[0] ?? null,
    producto?.imagenesGaleria?.[1] ?? null,
  ]);
  const [borrar, setBorrar] = useState<[boolean, boolean, boolean]>([false, false, false]);

  function handleImageChange(slot: 0 | 1 | 2, file: File | undefined) {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreviews((prev) => {
      const next = [...prev] as [string | null, string | null, string | null];
      next[slot] = url;
      return next;
    });
    // Si había marcado para borrar y ahora sube nueva, cancelar el borrado
    setBorrar((prev) => {
      const next = [...prev] as [boolean, boolean, boolean];
      next[slot] = false;
      return next;
    });
  }

  function handleBorrar(slot: 0 | 1 | 2) {
    setPreviews((prev) => {
      const next = [...prev] as [string | null, string | null, string | null];
      next[slot] = null;
      return next;
    });
    setBorrar((prev) => {
      const next = [...prev] as [boolean, boolean, boolean];
      next[slot] = true;
      return next;
    });
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    // Agregar flags de borrado
    if (borrar[0]) formData.set('borrar_imagen_1', '1');
    if (borrar[1]) formData.set('borrar_imagen_2', '1');
    if (borrar[2]) formData.set('borrar_imagen_3', '1');

    const path = esEdicion ? `/admin/producto.php?id=${producto!.id}` : '/admin/productos.php';
    const res = await apiSendForm(path, formData, 'POST');

    if (!res.ok) {
      setError(res.error ?? 'No se pudo guardar el producto.');
      setLoading(false);
      return;
    }

    router.push('/admin/productos/');
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">

      <Field label="Nombre">
        <input
          name="nombre"
          required
          defaultValue={producto?.nombre}
          className="w-full border border-graphite-border bg-transparent px-4 py-2.5 text-sm text-white outline-none focus:border-bronze"
        />
      </Field>

      <Field label="Catálogo (categoría)">
        <select
          name="catalogoId"
          required
          defaultValue={producto?.catalogoId ?? ''}
          className="w-full border border-graphite-border bg-graphite px-4 py-2.5 text-sm text-white outline-none focus:border-bronze"
        >
          <option value="" disabled>
            {catalogos.length === 0 ? 'Cargando catálogos…' : 'Seleccionar…'}
          </option>
          {catalogos.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Descripción corta (catálogo)">
        <input
          name="descripcionCorta"
          required
          maxLength={280}
          defaultValue={producto?.descripcionCorta}
          className="w-full border border-graphite-border bg-transparent px-4 py-2.5 text-sm text-white outline-none focus:border-bronze"
        />
      </Field>

      <Field label="Descripción larga (ficha de producto)">
        <RichTextEditor name="descripcionLarga" defaultValue={producto?.descripcionLarga} />
      </Field>

      {/* Imágenes del producto — hasta 3 */}
      <div>
        <p className="mb-3 text-[11px] uppercase tracking-wide text-graphite-muted">
          Imágenes del producto (máx. 3)
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {(['imagen_1', 'imagen_2', 'imagen_3'] as const).map((campo, i) => {
            const slot = i as 0 | 1 | 2;
            const label = i === 0 ? 'Imagen 1 — Principal' : `Imagen ${i + 1} — Opcional`;
            return (
              <ImageSlot
                key={campo}
                label={label}
                campo={campo}
                preview={previews[slot]}
                onFileChange={(file) => handleImageChange(slot, file)}
                onBorrar={() => handleBorrar(slot)}
              />
            );
          })}
        </div>
      </div>

      <div className="flex gap-6">
        <Field label="Destacado en home">
          <input
            type="checkbox"
            name="destacado"
            defaultChecked={producto?.destacado}
            className="accent-[#C8A96E]"
          />
        </Field>
        <Field label="Activo (visible al público)">
          <input
            type="checkbox"
            name="activo"
            defaultChecked={producto?.activo ?? true}
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
        {loading ? 'Guardando…' : esEdicion ? 'Guardar cambios' : 'Crear producto'}
      </button>
    </form>
  );
}

// ── Subcomponentes ────────────────────────────────────────────────────────────

function ImageSlot({
  label,
  campo,
  preview,
  onFileChange,
  onBorrar,
}: {
  label: string;
  campo: string;
  preview: string | null;
  onFileChange: (file: File | undefined) => void;
  onBorrar: () => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-[10px] uppercase tracking-wide text-graphite-muted">{label}</p>
      <div className="relative h-32 border border-dashed border-graphite-border bg-graphite-tile">
        {preview ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={onBorrar}
              className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center bg-black/70 text-xs text-white hover:bg-red-600"
              title="Eliminar imagen"
            >
              ×
            </button>
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-graphite-muted">
            Sin imagen
          </div>
        )}
      </div>
      <label className="cursor-pointer border border-graphite-border px-3 py-1.5 text-center text-[10px] uppercase tracking-wide text-graphite-muted hover:border-bronze hover:text-bronze">
        {preview ? 'Reemplazar' : 'Subir imagen'}
        <input
          name={campo}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          className="sr-only"
          onChange={(e) => onFileChange(e.target.files?.[0])}
        />
      </label>
    </div>
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
