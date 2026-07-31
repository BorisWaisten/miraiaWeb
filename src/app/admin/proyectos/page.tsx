import Link from 'next/link';
import { ProyectosTable } from '@/components/admin/ProyectosTable';

export default function AdminProyectosPage() {
  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-serif text-2xl text-white">Proyectos</h1>
        <Link href="/admin/proyectos/nuevo/" className="bg-bronze px-5 py-2.5 text-[11px] uppercase tracking-wide text-obsidian">
          + Nuevo proyecto
        </Link>
      </div>
      <ProyectosTable />
    </div>
  );
}
