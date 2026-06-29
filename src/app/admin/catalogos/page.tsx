import Link from 'next/link';
import { CatalogosTable } from '@/components/admin/CatalogosTable';

export default function AdminCatalogosPage() {
  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-serif text-2xl text-white">Catálogos</h1>
        <Link
          href="/admin/catalogos/nuevo/"
          className="bg-bronze px-5 py-2.5 text-[11px] uppercase tracking-wide text-obsidian"
        >
          + Nuevo catálogo
        </Link>
      </div>
      <CatalogosTable />
    </div>
  );
}
