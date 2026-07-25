'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiGet, apiDelete } from '@/lib/api';
import type { BlogPost } from '@/models/blog';

/** Tabla de posteos del panel admin — listar, ir a editar, eliminar. */
export function BlogPostsTable() {
  const [posts, setPosts] = useState<BlogPost[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function cargar() {
    const res = await apiGet<BlogPost[]>('/admin/blog-posts.php');
    if (!res.ok) {
      setError(res.error ?? 'Error al cargar el blog.');
      return;
    }
    setPosts(res.data ?? []);
  }

  useEffect(() => { cargar(); }, []);

  async function handleEliminar(id: number) {
    if (!confirm('¿Eliminar este posteo? Esta acción no se puede deshacer.')) return;
    const res = await apiDelete(`/admin/blog-post.php?id=${id}`);
    if (res.ok) cargar();
  }

  if (error) return <p className="text-sm text-red-400">{error}</p>;
  if (!posts) return <p className="text-sm text-graphite-muted">Cargando…</p>;

  return (
    <div className="overflow-x-auto">
    <table className="w-full min-w-[640px] border border-graphite-border text-left text-sm">
      <thead>
        <tr className="border-b border-graphite-border text-[11px] uppercase tracking-wide text-graphite-muted">
          <th className="px-4 py-3">Título</th>
          <th className="px-4 py-3">Categoría</th>
          <th className="px-4 py-3">Estado</th>
          <th className="px-4 py-3" />
        </tr>
      </thead>
      <tbody>
        {posts.map((p) => (
          <tr key={p.id} className="border-b border-graphite-border last:border-0">
            <td className="px-4 py-3 text-white">{p.titulo}</td>
            <td className="px-4 py-3 text-graphite-muted">{p.categoria ?? '—'}</td>
            <td className="px-4 py-3">
              <span className={p.publicado ? 'text-bronze' : 'text-graphite-muted'}>
                {p.publicado ? 'Publicado' : 'Borrador'}
              </span>
            </td>
            <td className="space-x-4 px-4 py-3 text-right">
              <Link href={`/admin/blog/editar/?id=${p.id}`} className="text-bronze hover:underline">
                Editar
              </Link>
              <button onClick={() => handleEliminar(p.id)} className="text-graphite-muted hover:text-red-400">
                Eliminar
              </button>
            </td>
          </tr>
        ))}
        {posts.length === 0 && (
          <tr>
            <td colSpan={4} className="px-4 py-6 text-center text-graphite-muted">
              Todavía no hay posteos cargados.
            </td>
          </tr>
        )}
      </tbody>
    </table>
    </div>
  );
}
