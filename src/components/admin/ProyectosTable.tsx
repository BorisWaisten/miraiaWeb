'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiGet, apiDelete } from '@/lib/api';
import type { Proyecto } from '@/models/proyecto';

/** Tabla de "Proyectos realizados" del panel admin — listar, ir a editar, eliminar. */
export function ProyectosTable() {
  const [proyectos, setProyectos] = useState<Proyecto[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function cargar() {
    const res = await apiGet<Proyecto[]>('/admin/proyectos.php');
    if (!res.ok) {
      setError(res.error ?? 'Error al cargar los proyectos.');
      return;
    }
    setProyectos(res.data ?? []);
  }

  useEffect(() => { cargar(); }, []);

  async function handleEliminar(id: number) {
    if (!confirm('¿Eliminar este proyecto? Esta acción no se puede deshacer.')) return;
    const res = await apiDelete(`/admin/proyecto.php?id=${id}`);
    if (res.ok) cargar();
  }

  if (error) return <p className="text-sm text-red-400">{error}</p>;
  if (!proyectos) return <p className="text-sm text-graphite-muted">Cargando…</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border border-graphite-border text-left text-sm">
        <thead>
          <tr className="border-b border-graphite-border text-[11px] uppercase tracking-wide text-graphite-muted">
            <th className="px-4 py-3">Orden</th>
            <th className="px-4 py-3">Título</th>
            <th className="px-4 py-3">Subtítulo</th>
            <th className="px-4 py-3">Card grande</th>
            <th className="px-4 py-3">Estado</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {proyectos.map((p) => (
            <tr key={p.id} className="border-b border-graphite-border last:border-0">
              <td className="px-4 py-3 text-graphite-muted">{p.orden}</td>
              <td className="px-4 py-3 text-white">{p.etiqueta}</td>
              <td className="px-4 py-3 text-graphite-muted">{p.nombre}</td>
              <td className="px-4 py-3 text-graphite-muted">{p.esPrincipal ? 'Sí' : '—'}</td>
              <td className="px-4 py-3">
                <span className={p.activo ? 'text-bronze' : 'text-graphite-muted'}>
                  {p.activo ? 'Activo' : 'Oculto'}
                </span>
              </td>
              <td className="space-x-4 px-4 py-3 text-right">
                <Link href={`/admin/proyectos/editar/?id=${p.id}`} className="text-bronze hover:underline">
                  Editar
                </Link>
                <button onClick={() => handleEliminar(p.id)} className="text-graphite-muted hover:text-red-400">
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
          {proyectos.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-6 text-center text-graphite-muted">
                Todavía no hay proyectos cargados — la sección no se muestra en el home hasta que haya al menos uno.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
