'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiGet, apiDelete } from '@/lib/api';
import type { Catalogo } from '@/models/catalogo';

export function CatalogosTable() {
  const [catalogos, setCatalogos] = useState<Catalogo[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function cargar() {
    const res = await apiGet<Catalogo[]>('/admin/catalogos.php');
    if (!res.ok) {
      setError(res.error ?? 'Error al cargar catálogos.');
      return;
    }
    setCatalogos(res.data ?? []);
  }

  useEffect(() => { cargar(); }, []);

  async function handleEliminar(catalogo: Catalogo) {
    if (catalogo.totalProductos > 0) {
      alert(
        `No se puede eliminar "${catalogo.nombre}": tiene ${catalogo.totalProductos} producto(s) asociado(s).\n\nReasigná o eliminá esos productos primero.`
      );
      return;
    }
    if (!confirm(`¿Eliminar el catálogo "${catalogo.nombre}"? Esta acción no se puede deshacer.`)) {
      return;
    }
    const res = await apiDelete(`/admin/catalogo.php?id=${catalogo.id}`);
    if (res.ok) {
      cargar();
    } else {
      alert(res.error ?? 'No se pudo eliminar el catálogo.');
    }
  }

  if (error) return <p className="text-sm text-red-400">{error}</p>;
  if (!catalogos) return <p className="text-sm text-graphite-muted">Cargando…</p>;

  return (
    <table className="w-full border border-graphite-border text-left text-sm">
      <thead>
        <tr className="border-b border-graphite-border text-[11px] uppercase tracking-wide text-graphite-muted">
          <th className="px-4 py-3">Nombre</th>
          <th className="px-4 py-3">Slug</th>
          <th className="px-4 py-3">Productos</th>
          <th className="px-4 py-3">Estado</th>
          <th className="px-4 py-3" />
        </tr>
      </thead>
      <tbody>
        {catalogos.map((c) => (
          <tr key={c.id} className="border-b border-graphite-border last:border-0">
            <td className="px-4 py-3 text-white">{c.nombre}</td>
            <td className="px-4 py-3 font-mono text-xs text-graphite-muted">{c.slug}</td>
            <td className="px-4 py-3 text-graphite-muted">{c.totalProductos}</td>
            <td className="px-4 py-3">
              <span className={c.activo ? 'text-bronze' : 'text-graphite-muted'}>
                {c.activo ? 'Activo' : 'Inactivo'}
              </span>
            </td>
            <td className="space-x-4 px-4 py-3 text-right">
              <Link href={`/admin/catalogos/editar/?id=${c.id}`} className="text-bronze hover:underline">
                Editar
              </Link>
              <button
                onClick={() => handleEliminar(c)}
                className={c.totalProductos > 0 ? 'cursor-not-allowed text-graphite-muted opacity-40' : 'text-graphite-muted hover:text-red-400'}
              >
                Eliminar
              </button>
            </td>
          </tr>
        ))}
        {catalogos.length === 0 && (
          <tr>
            <td colSpan={5} className="px-4 py-6 text-center text-graphite-muted">
              No hay catálogos creados todavía.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
