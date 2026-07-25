'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BlogPostForm } from '@/components/admin/BlogPostForm';
import { apiGet } from '@/lib/api';
import type { BlogPost } from '@/models/blog';

/**
 * Edición de posteo vía /admin/blog/editar/?id=... (query param, no segmento
 * dinámico) — mismo motivo que /admin/productos/editar/: build estático,
 * posteos creados después del build.
 */
export default function EditarBlogPostPage() {
  const [id, setId] = useState<number | null>(null);
  const [post, setPost] = useState<BlogPost | null | undefined>(undefined); // undefined = cargando
  const [notFoundFlag, setNotFoundFlag] = useState(false);

  useEffect(() => {
    const rawId = new URLSearchParams(window.location.search).get('id');
    const parsed = Number(rawId);
    if (!rawId || !Number.isInteger(parsed)) {
      setNotFoundFlag(true);
      return;
    }
    setId(parsed);
  }, []);

  useEffect(() => {
    if (id === null) return;
    apiGet<BlogPost>(`/admin/blog-post.php?id=${id}`).then((res) => {
      if (!res.ok || !res.data) {
        setNotFoundFlag(true);
        return;
      }
      setPost(res.data);
    });
  }, [id]);

  if (notFoundFlag) {
    return (
      <div>
        <p className="mb-4 text-sm text-graphite-muted">Posteo no encontrado.</p>
        <Link href="/admin/blog/" className="text-[11px] uppercase tracking-wide text-bronze">
          ← Volver al listado
        </Link>
      </div>
    );
  }

  if (!post) {
    return <p className="text-sm text-graphite-muted">Cargando…</p>;
  }

  return (
    <div>
      <h1 className="mb-8 font-serif text-2xl text-white">Editar posteo</h1>
      <BlogPostForm post={post} />
    </div>
  );
}
