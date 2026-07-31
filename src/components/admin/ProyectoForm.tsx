'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { apiSendJson } from '@/lib/api';
import type { Proyecto } from '@/models/proyecto';

interface Props {
  proyecto?: Proyecto; // si viene, el form opera en modo "editar"
}

/**
 * Formulario de alta/edición de "Proyecto realizado" (sección del home).
 * La imagen es una URL pegada a mano (Cloudinary u otro host) — todavía no
 * hay carpeta ni convención propia en Cloudinary para proyectos, así que no
 * hay selector/upload: se sube la foto a mano y se pega el link, igual que
 * en Nosotros.
 */
export function ProyectoForm({ proyecto }: Props) {
  const router = useRouter();
  const esEdicion = Boolean(proyecto);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [etiqueta, setEtiqueta] = useState(proyecto?.etiqueta ?? '');
  const [nombre, setNombre] = useState(proyecto?.nombre ?? '');
  const [cliente, setCliente] = useState(proyecto?.cliente ?? '');
  const [imagen, setImagen] = useState(proyecto?.imagen ?? '');
  const [esPrincipal, setEsPrincipal] = useState(proyecto?.esPrincipal ?? false);
  const [orden, setOrden] = useState(proyecto?.orden ?? 0);
  const [activo, setActivo] = useState(proyecto?.activo ?? true);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const datos = { etiqueta, nombre, cliente, imagen, esPrincipal, orden, activo };
    const path = esEdicion ? `/admin/proyecto.php?id=${proyecto!.id}` : '/admin/proyectos.php';
    const res = await apiSendJson(path, datos);

    if (!res.ok) {
      setError(res.error ?? 'No se pudo guardar el proyecto.');
      setLoading(false);
      return;
    }

    router.push('/admin/proyectos/');
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <Field label="Título — tipo de espacio y ubicación" hint='Ej. "Oficinas corporativas · Palermo, CABA"'>
        <input
          value={etiqueta}
          onChange={(e) => setEtiqueta(e.target.value)}
          required
          minLength={2}
          maxLength={160}
          className="w-full border border-graphite-border bg-transparent px-4 py-2.5 text-sm text-white outline-none focus:border-bronze"
        />
      </Field>

      <Field label="Subtítulo — producto instalado" hint='Ej. "Alfombra modular Vienna — 850 m²"'>
        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
          minLength={2}
          maxLength={160}
          className="w-full border border-graphite-border bg-transparent px-4 py-2.5 text-sm text-white outline-none focus:border-bronze"
        />
      </Field>

      <Field label="Cliente (opcional)" hint='Ej. "Arq. Estudio Bavera"'>
        <input
          value={cliente}
          onChange={(e) => setCliente(e.target.value)}
          maxLength={160}
          className="w-full border border-graphite-border bg-transparent px-4 py-2.5 text-sm text-white outline-none focus:border-bronze"
        />
      </Field>

      <Field label="Imagen (opcional — URL, ej. de Cloudinary)">
        <input
          value={imagen}
          onChange={(e) => setImagen(e.target.value)}
          placeholder="https://res.cloudinary.com/..."
          className="w-full border border-graphite-border bg-transparent px-4 py-2.5 text-sm text-white placeholder-graphite-muted outline-none focus:border-bronze"
        />
        {imagen.trim() !== '' && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imagen} alt="" className="mt-3 h-32 w-auto border border-graphite-border object-cover" />
        )}
      </Field>

      <Field label="Card grande (tarjeta principal, 2/3 del grid)">
        <input
          type="checkbox"
          checked={esPrincipal}
          onChange={(e) => setEsPrincipal(e.target.checked)}
          className="accent-[#C8A96E]"
        />
        <span className="ml-2 text-xs text-graphite-muted">
          Solo puede haber una — al marcar esta, se desmarca cualquier otra.
        </span>
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

      <Field label="Activo (visible al público)">
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
        {loading ? 'Guardando…' : esEdicion ? 'Guardar cambios' : 'Crear proyecto'}
      </button>
    </form>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] uppercase tracking-wide text-graphite-muted">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1.5 text-xs text-graphite-muted">{hint}</p>}
    </div>
  );
}
