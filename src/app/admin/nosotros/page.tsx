import Link from 'next/link';
import { NosotrosSeccionesTable } from '@/components/admin/NosotrosSeccionesTable';

export default function AdminNosotrosPage() {
  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-serif text-2xl text-white">Nosotros</h1>
        <Link href="/admin/nosotros/nuevo/" className="bg-bronze px-5 py-2.5 text-[11px] uppercase tracking-wide text-obsidian">
          + Nueva sección
        </Link>
      </div>
      <NosotrosSeccionesTable />
    </div>
  );
}
