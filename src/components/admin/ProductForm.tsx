'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { apiSendForm } from '@/lib/api';
import type { Producto } from '@/models/producto';

interface Props {
  producto?: Producto; // si viene, el form opera en modo "editar"
}

/**
 * Formulario de alta/edición de producto (serie).
 * — Nombre, subtítulo, descripciones + imagen principal + galería de N imágenes.
 * — En edición: `galeria_conservar` (JSON) indica qué imágenes existentes
 *   se mantienen; los archivos nuevos van en `galeria[]` y se agregan.
 */
export function ProductForm({ producto }: Props) {
  const router = useRouter();
  const esEdicion = Boolean(producto);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // — Imagen principal —
  const [previewPrincipal, setPreviewPrincipal] = useState<string | null>(
    producto?.imagenPrincipal ?? null,
  );
  const [borrarPrincipal, setBorrarPrincipal] = useState(false);

  // — Galería: rutas existentes conservadas + archivos nuevos —
  // La URL de preview se crea UNA vez al seleccionar el archivo; crearla en
  // cada render genera blobs nuevos por imagen y rompe el preview múltiple.
  const [galeriaExistente, setGaleriaExistente] = useState<string[]>(
    producto?.imagenesGaleria ?? [],
  );
  const [galeriaNueva, setGaleriaNueva] = useState<{ file: File; url: string }[]>([]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    if (borrarPrincipal) formData.set('borrar_imagen_1', '1');
    if (esEdicion) formData.set('galeria_conservar', JSON.stringify(galeriaExistente));
    for (const { file } of galeriaNueva) formData.append('galeria[]', file);

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

      <Field label="Subtítulo (opcional)">
        <input
          name="subtitulo"
          maxLength={160}
          defaultValue={producto?.subtitulo ?? ''}
          placeholder="Ej. Level Loop · PP + Fine Bitumen · 50×50 cm"
          className="w-full border border-graphite-border bg-transparent px-4 py-2.5 text-sm text-white placeholder-graphite-muted outline-none focus:border-bronze"
        />
      </Field>

      <Field label="Descripción breve (opcional)">
        <input
          name="descripcionCorta"
          maxLength={280}
          defaultValue={producto?.descripcionCorta ?? ''}
          className="w-full border border-graphite-border bg-transparent px-4 py-2.5 text-sm text-white outline-none focus:border-bronze"
        />
      </Field>

      <Field label="Descripción larga (opcional — los saltos de línea se respetan)">
        <textarea
          name="descripcionLarga"
          rows={6}
          maxLength={20000}
          defaultValue={producto?.descripcionLarga ?? ''}
          className="w-full border border-graphite-border bg-transparent px-4 py-2.5 text-sm text-white outline-none focus:border-bronze"
        />
      </Field>

      {/* Imagen principal */}
      <div>
        <p className="mb-3 text-[11px] uppercase tracking-wide text-graphite-muted">
          Imagen principal
        </p>
        <div className="w-40">
          <Thumb
            src={previewPrincipal}
            onBorrar={() => {
              setPreviewPrincipal(null);
              setBorrarPrincipal(true);
            }}
          />
          <label className="mt-2 block cursor-pointer border border-graphite-border px-3 py-1.5 text-center text-[10px] uppercase tracking-wide text-graphite-muted hover:border-bronze hover:text-bronze">
            {previewPrincipal ? 'Reemplazar' : 'Subir imagen'}
            <input
              name="imagen_1"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setPreviewPrincipal(URL.createObjectURL(file));
                setBorrarPrincipal(false);
              }}
            />
          </label>
        </div>
      </div>

      {/* Galería */}
      <div>
        <p className="mb-3 text-[11px] uppercase tracking-wide text-graphite-muted">
          Galería (variantes de la serie)
        </p>
        <div className="grid grid-cols-3 gap-4 sm:grid-cols-4">
          {galeriaExistente.map((ruta) => (
            <Thumb
              key={ruta}
              src={ruta}
              onBorrar={() => setGaleriaExistente((prev) => prev.filter((r) => r !== ruta))}
            />
          ))}
          {galeriaNueva.map((item) => (
            <Thumb
              key={item.url}
              src={item.url}
              onBorrar={() => {
                URL.revokeObjectURL(item.url);
                setGaleriaNueva((prev) => prev.filter((x) => x.url !== item.url));
              }}
            />
          ))}
        </div>
        <label className="mt-3 inline-block cursor-pointer border border-graphite-border px-3 py-1.5 text-[10px] uppercase tracking-wide text-graphite-muted hover:border-bronze hover:text-bronze">
          Agregar imágenes
          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="sr-only"
            onChange={(e) => {
              const nuevos = Array.from(e.target.files ?? []).map((file) => ({
                file,
                url: URL.createObjectURL(file),
              }));
              setGaleriaNueva((prev) => [...prev, ...nuevos]);
              e.target.value = '';
            }}
          />
        </label>
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

function Thumb({ src, onBorrar }: { src: string | null; onBorrar: () => void }) {
  return (
    <div className="relative h-32 border border-dashed border-graphite-border bg-graphite-tile">
      {src ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="" className="h-full w-full object-cover" />
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
