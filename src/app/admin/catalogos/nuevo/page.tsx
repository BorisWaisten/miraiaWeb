import Link from 'next/link';
import { CatalogoForm } from '@/components/admin/CatalogoForm';

export default function NuevoCatalogoPage() {
  return (
    <div>
      <Link
        href="/admin/catalogos/"
        className="mb-6 inline-block text-[11px] uppercase tracking-wide text-graphite-muted hover:text-bronze"
      >
        ← Volver a catálogos
      </Link>
      <h1 className="mb-8 font-serif text-2xl text-white">Nuevo catálogo</h1>
      <CatalogoForm />
    </div>
  );
}
