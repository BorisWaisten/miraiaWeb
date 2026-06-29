'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CatalogoForm } from '@/components/admin/CatalogoForm';
import { apiGet } from '@/lib/api';
import type { Catalogo } from '@/models/catalogo';

export default function EditarCatalogoPage() {
  const [id, setId] = useState<number | null>(null);
  const [catalogo, setCatalogo] = useState<Catalogo | null | undefined>(undefined);
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
    apiGet<Catalogo>(`/admin/catalogo.php?id=${id}`).then((res) => {
      if (!res.ok || !res.data) {
        setNotFoundFlag(true);
        return;
      }
      setCatalogo(res.data);
    });
  }, [id]);

  if (notFoundFlag) {
    return (
      <div>
        <p className="mb-4 text-sm text-graphite-muted">Catálogo no encontrado.</p>
        <Link href="/admin/catalogos/" className="text-[11px] uppercase tracking-wide text-bronze">
          ← Volver a catálogos
        </Link>
      </div>
    );
  }

  if (!catalogo) {
    return <p className="text-sm text-graphite-muted">Cargando…</p>;
  }

  return (
    <div>
      <Link
        href="/admin/catalogos/"
        className="mb-6 inline-block text-[11px] uppercase tracking-wide text-graphite-muted hover:text-bronze"
      >
        ← Volver a catálogos
      </Link>
      <h1 className="mb-8 font-serif text-2xl text-white">Editar catálogo</h1>
      <CatalogoForm catalogo={catalogo} />
    </div>
  );
}
