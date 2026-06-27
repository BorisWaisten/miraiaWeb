'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ProductForm } from '@/components/admin/ProductForm';
import { apiGet } from '@/lib/api';
import type { Producto } from '@/models/producto';

/**
 * Edición de producto vía /admin/productos/editar/?id=... (query param, no
 * segmento dinámico): igual que en /productos/ver/, evita depender de
 * generateStaticParams en una build estática donde los productos se crean
 * después del build, desde este mismo panel.
 */
export default function EditarProductoPage() {
  const [id, setId] = useState<number | null>(null);
  const [producto, setProducto] = useState<Producto | null | undefined>(undefined); // undefined = cargando
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
    apiGet<Producto>(`/admin/producto.php?id=${id}`).then((res) => {
      if (!res.ok || !res.data) {
        setNotFoundFlag(true);
        return;
      }
      setProducto(res.data);
    });
  }, [id]);

  if (notFoundFlag) {
    return (
      <div>
        <p className="mb-4 text-sm text-graphite-muted">Producto no encontrado.</p>
        <Link href="/admin/productos/" className="text-[11px] uppercase tracking-wide text-bronze">
          ← Volver al listado
        </Link>
      </div>
    );
  }

  if (!producto) {
    return <p className="text-sm text-graphite-muted">Cargando…</p>;
  }

  return (
    <div>
      <h1 className="mb-8 font-serif text-2xl text-white">Editar producto</h1>
      <ProductForm producto={producto} />
    </div>
  );
}
