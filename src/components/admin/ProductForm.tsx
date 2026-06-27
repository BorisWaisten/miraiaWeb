'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { apiSendForm } from '@/lib/api';
import { CATEGORIAS_PRODUCTO, CATEGORIA_LABEL, type Producto } from '@/models/producto';

interface Props {
  producto?: Producto; // si viene, el form opera en modo "editar"
}

/**
 * Formulario de alta/edición de producto. Envía `multipart/form-data` directo
 * a la API PHP (sin precio) para que el backend procese la imagen adjunta
 * junto con los datos de texto en una sola request.
 *
 * Alta y edición usan POST contra distintas URLs (la API distingue "crear" de
 * "actualizar" por la presencia de ?id= en la URL, no por el método HTTP —
 * PHP no parsea multipart/form-data en requests PUT de forma nativa).
 */
export function ProductForm({ producto }: Props) {
  const router = useRouter();
  const esEdicion = Boolean(producto);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(producto?.imagenPrincipal ?? null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
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

      <Field label="Categoría">
        <select
          name="categoria"
          required
          defaultValue={producto?.categoria}
          className="w-full border border-graphite-border bg-graphite px-4 py-2.5 text-sm text-white outline-none focus:border-bronze"
        >
          <option value="" disabled>
            Seleccionar…
          </option>
          {CATEGORIAS_PRODUCTO.map((cat) => (
            <option key={cat} value={cat}>
              {CATEGORIA_LABEL[cat]}
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
        <textarea
          name="descripcionLarga"
          rows={4}
          defaultValue={producto?.descripcionLarga ?? ''}
          className="w-full border border-graphite-border bg-transparent px-4 py-2.5 text-sm text-white outline-none focus:border-bronze"
        />
      </Field>

      <Field label="Imagen principal">
        <input
          name="imagen"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) setPreview(URL.createObjectURL(file));
          }}
          className="w-full border border-graphite-border bg-transparent px-4 py-2.5 text-sm text-white outline-none file:mr-4 file:border-0 file:bg-bronze file:px-3 file:py-1.5 file:text-obsidian"
        />
        {preview && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Vista previa" className="mt-3 h-40 w-40 object-cover" />
        )}
      </Field>

      <div className="flex gap-6">
        <Field label="Destacado en home">
          <input type="checkbox" name="destacado" defaultChecked={producto?.destacado} className="accent-[#C8A96E]" />
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] uppercase tracking-wide text-graphite-muted">{label}</label>
      {children}
    </div>
  );
}
