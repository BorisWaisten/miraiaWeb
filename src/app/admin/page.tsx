'use client';

import { useEffect, useState } from 'react';
import { apiGet } from '@/lib/api';
import type { Producto } from '@/models/producto';

export default function AdminDashboardPage() {
  const [productos, setProductos] = useState<Producto[] | null>(null);

  useEffect(() => {
    apiGet<Producto[]>('/admin/productos.php').then((res) => setProductos(res.data ?? []));
  }, []);

  if (productos === null) {
    return <p className="text-sm text-graphite-muted">Cargando…</p>;
  }

  const activos = productos.filter((p) => p.activo).length;

  return (
    <div>
      <h1 className="mb-8 font-serif text-2xl text-white">Resumen</h1>
      <div className="grid grid-cols-1 gap-px bg-graphite-border sm:grid-cols-3">
        <Card label="Productos totales" valor={productos.length} />
        <Card label="Productos activos" valor={activos} />
        <Card label="Productos inactivos" valor={productos.length - activos} />
      </div>
    </div>
  );
}

function Card({ label, valor }: { label: string; valor: number }) {
  return (
    <div className="bg-graphite p-6">
      <p className="mb-2 font-serif text-3xl text-bronze">{valor}</p>
      <p className="text-xs uppercase tracking-wide text-graphite-muted">{label}</p>
    </div>
  );
}
