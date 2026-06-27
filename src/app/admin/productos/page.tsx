import Link from 'next/link';
import { ProductsTable } from '@/components/admin/ProductsTable';

export default function AdminProductosPage() {
  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-serif text-2xl text-white">Productos</h1>
        <Link href="/admin/productos/nuevo/" className="bg-bronze px-5 py-2.5 text-[11px] uppercase tracking-wide text-obsidian">
          + Nuevo producto
        </Link>
      </div>
      <ProductsTable />
    </div>
  );
}
