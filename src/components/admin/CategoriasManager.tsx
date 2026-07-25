'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { apiGet, apiSendJson, apiDelete } from '@/lib/api';
import { slugify } from '@/lib/slug';
import type { Categoria } from '@/models/categoria';

/** Listado + alta/edición/borrado de categorías (migración 007). Form simple: solo nombre, el slug lo genera el backend. */
export function CategoriasManager() {
  const [categorias, setCategorias] = useState<Categoria[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [nombre, setNombre] = useState('');
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [guardando, setGuardando] = useState(false);

  async function cargar() {
    const res = await apiGet<Categoria[]>('/admin/categorias.php');
    if (!res.ok) {
      setError(res.error ?? 'Error al cargar categorías.');
      return;
    }
    setCategorias(res.data ?? []);
  }

  useEffect(() => { cargar(); }, []);

  function comenzarEdicion(categoria: Categoria) {
    setEditandoId(categoria.id);
    setNombre(categoria.nombre);
  }

  function cancelarEdicion() {
    setEditandoId(null);
    setNombre('');
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setError(null);

    const path = editandoId ? `/admin/categoria.php?id=${editandoId}` : '/admin/categorias.php';
    const res = await apiSendJson(path, { nombre });

    setGuardando(false);
    if (!res.ok) {
      setError(res.error ?? 'No se pudo guardar la categoría.');
      return;
    }
    cancelarEdicion();
    cargar();
  }

  async function handleEliminar(id: number) {
    if (!confirm('¿Eliminar esta categoría? Los productos que la usaban quedarán sin categoría.')) return;
    const res = await apiDelete(`/admin/categoria.php?id=${id}`);
    if (res.ok) cargar();
  }

  return (
    <div className="max-w-xl">
      <form onSubmit={handleSubmit} className="mb-10 flex items-end gap-4">
        <div className="flex-1">
          <label className="mb-1.5 block text-[11px] uppercase tracking-wide text-graphite-muted">
            {editandoId ? 'Editar categoría' : 'Nueva categoría'}
          </label>
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            minLength={2}
            maxLength={160}
            placeholder="Ej. Alfombra Modular Level Loop"
            className="w-full border border-graphite-border bg-transparent px-4 py-2.5 text-sm text-white outline-none focus:border-bronze"
          />
          {nombre.trim() !== '' && (
            <p className="mt-1.5 text-[11px] text-graphite-muted">Slug: {slugify(nombre)}</p>
          )}
        </div>
        <button
          type="submit"
          disabled={guardando}
          className="bg-bronze px-6 py-2.5 text-[11px] uppercase tracking-wide text-obsidian disabled:opacity-60"
        >
          {guardando ? 'Guardando…' : editandoId ? 'Guardar' : 'Crear'}
        </button>
        {editandoId && (
          <button
            type="button"
            onClick={cancelarEdicion}
            className="px-4 py-2.5 text-[11px] uppercase tracking-wide text-graphite-muted hover:text-white"
          >
            Cancelar
          </button>
        )}
      </form>

      {error && <p className="mb-4 text-xs text-red-400">{error}</p>}

      {categorias === null ? (
        <p className="text-sm text-graphite-muted">Cargando…</p>
      ) : (
        <div className="overflow-x-auto">
        <table className="w-full min-w-[420px] border border-graphite-border text-left text-sm">
          <thead>
            <tr className="border-b border-graphite-border text-[11px] uppercase tracking-wide text-graphite-muted">
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {categorias.map((c) => (
              <tr key={c.id} className="border-b border-graphite-border last:border-0">
                <td className="px-4 py-3 text-white">{c.nombre}</td>
                <td className="px-4 py-3 text-graphite-muted">{c.slug}</td>
                <td className="space-x-4 px-4 py-3 text-right">
                  <button onClick={() => comenzarEdicion(c)} className="text-bronze hover:underline">
                    Editar
                  </button>
                  <button onClick={() => handleEliminar(c.id)} className="text-graphite-muted hover:text-red-400">
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {categorias.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-graphite-muted">
                  Todavía no hay categorías cargadas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      )}
    </div>
  );
}
