'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ProyectoForm } from '@/components/admin/ProyectoForm';
import { apiGet } from '@/lib/api';
import type { Proyecto } from '@/models/proyecto';

/**
 * Edición de proyecto vía /admin/proyectos/editar/?id=... (query param, no
 * segmento dinámico) — mismo motivo que /admin/nosotros/editar/: build estático.
 */
export default function EditarProyectoPage() {
  const [id, setId] = useState<number | null>(null);
  const [proyecto, setProyecto] = useState<Proyecto | null | undefined>(undefined); // undefined = cargando
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
    apiGet<Proyecto>(`/admin/proyecto.php?id=${id}`).then((res) => {
      if (!res.ok || !res.data) {
        setNotFoundFlag(true);
        return;
      }
      setProyecto(res.data);
    });
  }, [id]);

  if (notFoundFlag) {
    return (
      <div>
        <p className="mb-4 text-sm text-graphite-muted">Proyecto no encontrado.</p>
        <Link href="/admin/proyectos/" className="text-[11px] uppercase tracking-wide text-bronze">
          ← Volver al listado
        </Link>
      </div>
    );
  }

  if (!proyecto) {
    return <p className="text-sm text-graphite-muted">Cargando…</p>;
  }

  return (
    <div>
      <h1 className="mb-8 font-serif text-2xl text-white">Editar proyecto</h1>
      <ProyectoForm proyecto={proyecto} />
    </div>
  );
}
