'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { apiSendForm, apiSendJson, apiDelete, apiGet, obtenerImagenesVariante } from '@/lib/api';
import { slugify } from '@/lib/slug';
import type { Producto } from '@/models/producto';
import type { Categoria } from '@/models/categoria';

interface Props {
  producto?: Producto; // si viene, el form opera en modo "editar"
}

interface VarianteForm {
  id?: number; // presente = variante existente; ausente = nueva
  nombre: string;
}

/**
 * Formulario de alta/edición de producto (serie).
 * — Nombre, categoría, subtítulo, descripciones.
 * — Variantes de color: solo nombre (el slug se autogenera). Sin upload de
 *   imágenes en ningún lado del form (migración 008) — el cliente las sube
 *   directo a Cloudinary bajo miraia/productos/{categoria.slug}/{variante.slug}/,
 *   y el slug de la variante debe coincidir con esa carpeta. La "imagen
 *   principal" que se ve en listados es automáticamente la primera imagen
 *   de la primera variante — no hay nada que subir ni elegir acá.
 */
export function ProductForm({ producto }: Props) {
  const router = useRouter();
  const esEdicion = Boolean(producto);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // — Categorías —
  // Select CONTROLADO a propósito: las opciones llegan async (useEffect de
  // abajo) y con `defaultValue` React no vuelve a aplicar la selección
  // guardada una vez que las <option> aparecen — el dropdown queda pegado en
  // "Sin categoría" aunque el producto sí tenga una, y al guardar la pisa a
  // NULL. Con `value` controlado no importa cuándo llegan las opciones.
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriaId, setCategoriaId] = useState(
    producto?.categoriaId != null ? String(producto.categoriaId) : '',
  );
  useEffect(() => {
    apiGet<Categoria[]>('/admin/categorias.php').then((res) => setCategorias(res.data ?? []));
  }, []);
  const categoriaSlug = categorias.find((c) => String(c.id) === categoriaId)?.slug ?? null;

  // — Variantes de color: solo nombre, slug lo genera el backend —
  const [variantes, setVariantes] = useState<VarianteForm[]>(
    producto?.variantes?.map((v) => ({ id: v.id, nombre: v.nombre })) ?? [],
  );

  // — Certificados PDF: existentes conservados + archivos nuevos —
  const [certExistentes, setCertExistentes] = useState(producto?.certificados ?? []);
  const [certNuevos, setCertNuevos] = useState<File[]>([]);

  /** Crea/actualiza/borra variantes vía sus endpoints CRUD para reflejar el estado local. */
  async function sincronizarVariantes(productoId: number) {
    const originales = producto?.variantes ?? [];
    const idsActuales = new Set(variantes.filter((v) => v.id).map((v) => v.id));
    const eliminadas = originales.filter((v) => !idsActuales.has(v.id));

    await Promise.all([
      ...eliminadas.map((v) => apiDelete(`/admin/variante.php?id=${v.id}`)),
      ...variantes.map((v) => {
        if (v.id) {
          const original = originales.find((o) => o.id === v.id);
          if (original && original.nombre === v.nombre) return Promise.resolve();
          return apiSendJson(`/admin/variante.php?id=${v.id}`, { nombre: v.nombre });
        }
        return apiSendJson('/admin/variantes.php', { productoId, nombre: v.nombre });
      }),
    ]);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    if (esEdicion) {
      formData.set('certificados_conservar', JSON.stringify(certExistentes.map((c) => c.ruta)));
    }
    for (const file of certNuevos) formData.append('certificados[]', file);

    const path = esEdicion ? `/admin/producto.php?id=${producto!.id}` : '/admin/productos.php';
    const res = await apiSendForm<Producto>(path, formData, 'POST');

    if (!res.ok || !res.data) {
      setError(res.error ?? 'No se pudo guardar el producto.');
      setLoading(false);
      return;
    }

    await sincronizarVariantes(res.data.id);

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

      <Field label="Línea de producto">
        <select
          name="linea"
          defaultValue={producto?.linea ?? 'alfombra-modular'}
          className="w-full border border-graphite-border bg-graphite px-4 py-2.5 text-sm text-white outline-none focus:border-bronze"
        >
          <option value="alfombra-modular">Alfombra Modular</option>
          <option value="piso-tecnico">Piso Técnico</option>
        </select>
      </Field>

      <Field label="Categoría (opcional)">
        <select
          name="categoriaId"
          value={categoriaId}
          onChange={(e) => setCategoriaId(e.target.value)}
          className="w-full border border-graphite-border bg-graphite px-4 py-2.5 text-sm text-white outline-none focus:border-bronze"
        >
          <option value="">Sin categoría</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>{c.nombre}</option>
          ))}
        </select>
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

      <Field label={'Especificaciones técnicas (opcional — una "Clave: Valor" por línea, se muestran como tabla)'}>
        <textarea
          name="especificaciones"
          rows={8}
          maxLength={5000}
          defaultValue={producto?.especificaciones ?? ''}
          placeholder={'Construcción: Level Loop\nMaterial: Polipropileno (PP)\nMedidas: 50 × 50 cm'}
          className="w-full border border-graphite-border bg-transparent px-4 py-2.5 font-mono text-sm text-white placeholder-graphite-muted outline-none focus:border-bronze"
        />
      </Field>

      {/* Certificados PDF */}
      <div>
        <p className="mb-3 text-[11px] uppercase tracking-wide text-graphite-muted">
          Certificados (PDF)
        </p>
        <ul className="space-y-1.5">
          {certExistentes.map((cert) => (
            <li key={cert.ruta} className="flex items-center gap-3 text-sm text-white">
              {cert.nombre}
              <button
                type="button"
                onClick={() => setCertExistentes((prev) => prev.filter((c) => c.ruta !== cert.ruta))}
                className="text-xs text-graphite-muted hover:text-red-400"
                title="Quitar certificado"
              >
                ✕
              </button>
            </li>
          ))}
          {certNuevos.map((file, i) => (
            <li key={`${file.name}-${i}`} className="flex items-center gap-3 text-sm text-mist/80">
              {file.name} (nuevo)
              <button
                type="button"
                onClick={() => setCertNuevos((prev) => prev.filter((_, j) => j !== i))}
                className="text-xs text-graphite-muted hover:text-red-400"
                title="Quitar certificado"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
        <label className="mt-3 inline-block cursor-pointer border border-graphite-border px-3 py-1.5 text-[10px] uppercase tracking-wide text-graphite-muted hover:border-bronze hover:text-bronze">
          Agregar PDFs
          <input
            type="file"
            multiple
            accept="application/pdf"
            className="sr-only"
            onChange={(e) => {
              setCertNuevos((prev) => [...prev, ...Array.from(e.target.files ?? [])]);
              e.target.value = '';
            }}
          />
        </label>
      </div>

      {/* Variantes de color */}
      <div>
        <p className="mb-1.5 text-[11px] uppercase tracking-wide text-graphite-muted">
          Variantes de color
        </p>
        <p className="mb-3 text-xs text-graphite-muted">
          El slug generado debe coincidir con la carpeta que el cliente ya creó en Cloudinary
          (miraia/productos/&lt;categoría&gt;/&lt;variante&gt;/). Las imágenes no se suben acá.
        </p>
        <div className="space-y-4">
          {variantes.map((v, i) => {
            // Slug real ya guardado si la variante existe; si es nueva o se
            // editó el nombre, se usa el preview client-side (mismo algoritmo
            // que el backend, salvo colisión de sufijo).
            const original = producto?.variantes?.find((o) => o.id === v.id);
            const varianteSlug = original?.nombre === v.nombre ? original.slug : (v.nombre.trim() ? slugify(v.nombre) : null);

            return (
              <div key={v.id ?? `nueva-${i}`} className="border border-graphite-border p-3">
                <div className="flex items-center gap-3">
                  <input
                    value={v.nombre}
                    onChange={(e) => {
                      const nombre = e.target.value;
                      setVariantes((prev) => prev.map((x, j) => (j === i ? { ...x, nombre } : x)));
                    }}
                    required
                    minLength={1}
                    maxLength={160}
                    placeholder="Ej. Rubí"
                    className="flex-1 border border-graphite-border bg-transparent px-4 py-2 text-sm text-white outline-none focus:border-bronze"
                  />
                  {varianteSlug && (
                    <span className="w-32 shrink-0 text-[11px] text-graphite-muted">{varianteSlug}</span>
                  )}
                  <button
                    type="button"
                    onClick={() => setVariantes((prev) => prev.filter((_, j) => j !== i))}
                    className="text-xs text-graphite-muted hover:text-red-400"
                    title="Quitar variante"
                  >
                    ✕
                  </button>
                </div>
                <div className="mt-3">
                  <VarianteImagenesPreview categoriaSlug={categoriaSlug} varianteSlug={varianteSlug} />
                </div>
              </div>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => setVariantes((prev) => [...prev, { nombre: '' }])}
          className="mt-3 inline-block cursor-pointer border border-graphite-border px-3 py-1.5 text-[10px] uppercase tracking-wide text-graphite-muted hover:border-bronze hover:text-bronze"
        >
          + Agregar variante
        </button>
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

/**
 * Portada + galería en miniatura de una variante, resueltas en vivo contra
 * Cloudinary (categoria.slug + variante.slug). Cada variante tiene sus
 * propias imágenes — esto es solo lectura, para que el admin confirme que
 * la carpeta de Cloudinary ya tiene fotos antes de guardar.
 */
function VarianteImagenesPreview({
  categoriaSlug,
  varianteSlug,
}: {
  categoriaSlug: string | null;
  varianteSlug: string | null;
}) {
  const [imagenes, setImagenes] = useState<string[] | null>(null);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (!categoriaSlug || !varianteSlug) {
      setImagenes(null);
      return;
    }
    let cancelado = false;
    setCargando(true);
    obtenerImagenesVariante(categoriaSlug, varianteSlug).then((res) => {
      if (cancelado) return;
      setImagenes(res.data ?? []);
      setCargando(false);
    });
    return () => {
      cancelado = true;
    };
  }, [categoriaSlug, varianteSlug]);

  if (!categoriaSlug) {
    return <p className="text-[11px] text-graphite-muted">Elegí una categoría arriba para ver las imágenes de esta variante.</p>;
  }
  if (!varianteSlug) {
    return null;
  }
  if (cargando) {
    return <p className="text-[11px] text-graphite-muted">Buscando imágenes en Cloudinary…</p>;
  }
  if (!imagenes || imagenes.length === 0) {
    return (
      <p className="text-[11px] text-graphite-muted">
        Sin imágenes en Cloudinary todavía — subilas a miraia/productos/{categoriaSlug}/{varianteSlug}/
      </p>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {imagenes.map((src, i) => (
        <div key={src} className="relative h-14 w-14 shrink-0 overflow-hidden border border-graphite-border bg-graphite-tile">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="" className="h-full w-full object-cover" />
          {i === 0 && (
            <span className="absolute bottom-0 left-0 right-0 bg-black/70 py-0.5 text-center text-[8px] uppercase tracking-wide text-bronze">
              Portada
            </span>
          )}
        </div>
      ))}
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
