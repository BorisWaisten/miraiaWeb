'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiGet, apiDelete } from '@/lib/api';
import { cldOptimizar } from '@/lib/cloudinary';
import type { Producto } from '@/models/producto';

/** Tabla de productos del panel admin — listar, ir a editar, eliminar. */
export function ProductsTable() {
  const [productos, setProductos] = useState<Producto[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function cargar() {
    const res = await apiGet<Producto[]>('/admin/productos.php');
    if (!res.ok) {
      setError(res.error ?? 'Error al cargar productos.');
      return;
    }
    setProductos(res.data ?? []);
  }

  useEffect(() => { cargar(); }, []);

  async function handleEliminar(id: number) {
    if (!confirm('¿Eliminar este producto? Esta acción no se puede deshacer.')) return;
    const res = await apiDelete(`/admin/producto.php?id=${id}`);
    if (res.ok) cargar();
  }

  if (error) return <p className="text-sm text-red-400">{error}</p>;
  if (!productos) return <p className="text-sm text-graphite-muted">Cargando…</p>;

  return (
    <div className="overflow-x-auto">
    <table className="w-full min-w-[640px] border border-graphite-border text-left text-sm">
      <thead>
        <tr className="border-b border-graphite-border text-[11px] uppercase tracking-wide text-graphite-muted">
          <th className="px-4 py-3 w-14" />
          <th className="px-4 py-3">Producto</th>
          <th className="px-4 py-3">Categoría</th>
          <th className="px-4 py-3">Variantes</th>
          <th className="px-4 py-3">Estado</th>
          <th className="px-4 py-3" />
        </tr>
      </thead>
      <tbody>
        {productos.map((p) => (
          <tr key={p.id} className="border-b border-graphite-border last:border-0">
            <td className="px-4 py-2">
              <div className="h-10 w-10 bg-graphite-tile overflow-hidden">
                {p.imagenPrincipal ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={cldOptimizar(p.imagenPrincipal, 100)}
                    alt={p.nombre}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-[9px] text-graphite-muted">
                    —
                  </div>
                )}
              </div>
            </td>
            <td className="px-4 py-3 text-white">{p.nombre}</td>
            <td className="px-4 py-3 text-graphite-muted">{p.categoria?.nombre ?? '—'}</td>
            {/* `?? []`: una API vieja (pre-migración 007) no manda variantes. */}
            <td className="px-4 py-3 text-graphite-muted">{(p.variantes ?? []).length}</td>
            <td className="px-4 py-3">
              <span className={p.activo ? 'text-bronze' : 'text-graphite-muted'}>
                {p.activo ? 'Activo' : 'Inactivo'}
              </span>
            </td>
            <td className="space-x-4 px-4 py-3 text-right">
              <Link href={`/admin/productos/editar/?id=${p.id}`} className="text-bronze hover:underline">
                Editar
              </Link>
              <button onClick={() => handleEliminar(p.id)} className="text-graphite-muted hover:text-red-400">
                Eliminar
              </button>
            </td>
          </tr>
        ))}
        {productos.length === 0 && (
          <tr>
            <td colSpan={6} className="px-4 py-6 text-center text-graphite-muted">
              Todavía no hay productos cargados.
            </td>
          </tr>
        )}
      </tbody>
    </table>
    </div>
  );
}
