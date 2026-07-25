'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { NosotrosSeccionForm } from '@/components/admin/NosotrosSeccionForm';
import { apiGet } from '@/lib/api';
import type { SeccionNosotros } from '@/models/nosotros';

/**
 * Edición de sección vía /admin/nosotros/editar/?id=... (query param, no
 * segmento dinámico) — mismo motivo que /admin/blog/editar/: build estático.
 */
export default function EditarSeccionNosotrosPage() {
  const [id, setId] = useState<number | null>(null);
  const [seccion, setSeccion] = useState<SeccionNosotros | null | undefined>(undefined); // undefined = cargando
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
    apiGet<SeccionNosotros>(`/admin/nosotros-seccion.php?id=${id}`).then((res) => {
      if (!res.ok || !res.data) {
        setNotFoundFlag(true);
        return;
      }
      setSeccion(res.data);
    });
  }, [id]);

  if (notFoundFlag) {
    return (
      <div>
        <p className="mb-4 text-sm text-graphite-muted">Sección no encontrada.</p>
        <Link href="/admin/nosotros/" className="text-[11px] uppercase tracking-wide text-bronze">
          ← Volver al listado
        </Link>
      </div>
    );
  }

  if (!seccion) {
    return <p className="text-sm text-graphite-muted">Cargando…</p>;
  }

  return (
    <div>
      <h1 className="mb-8 font-serif text-2xl text-white">Editar sección</h1>
      <NosotrosSeccionForm seccion={seccion} />
    </div>
  );
}
