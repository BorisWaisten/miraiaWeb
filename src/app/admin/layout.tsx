'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { verificarSesionAdmin } from '@/lib/api';
import { LogoutButton } from '@/components/admin/LogoutButton';

/**
 * Layout del panel de administración. Como el sitio es estático (sin server
 * ni middleware), la protección real pasa a ser server-side en cada llamada
 * a la API PHP (Auth::requerirSesion en php-api/lib/Auth.php) — esto de acá
 * es solo el guard de UX: si /admin/me.php no devuelve sesión válida, se
 * redirige a /admin/login/ antes de mostrar nada del panel.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [verificando, setVerificando] = useState(true);
  const [menuAbierto, setMenuAbierto] = useState(false);

  const esLogin = pathname === '/admin/login' || pathname === '/admin/login/';

  useEffect(() => {
    if (esLogin) {
      setVerificando(false);
      return;
    }
    verificarSesionAdmin().then((res) => {
      if (!res.ok || !res.data) {
        router.push(`/admin/login/?from=${encodeURIComponent(pathname)}`);
        return;
      }
      setAdminEmail(res.data.email);
      setVerificando(false);
    });
  }, [esLogin, pathname, router]);

  useEffect(() => {
    setMenuAbierto(false);
  }, [pathname]);

  if (esLogin) return <>{children}</>;

  if (verificando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-graphite">
        <p className="text-sm text-graphite-muted">Verificando sesión…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-graphite md:flex">
      {/* Barra superior — solo mobile */}
      <div className="flex items-center justify-between border-b border-graphite-border bg-obsidian px-6 py-4 md:hidden">
        <p className="font-serif text-base tracking-widest2 text-white">MIRAIA · Admin</p>
        <button
          type="button"
          onClick={() => setMenuAbierto((v) => !v)}
          aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={menuAbierto}
          className="flex h-9 w-9 flex-col items-center justify-center gap-[5px]"
        >
          <span className={`block h-px w-6 bg-white transition-transform duration-200 ${menuAbierto ? 'translate-y-[6.5px] rotate-45' : ''}`} />
          <span className={`block h-px w-6 bg-white transition-opacity duration-200 ${menuAbierto ? 'opacity-0' : ''}`} />
          <span className={`block h-px w-6 bg-white transition-transform duration-200 ${menuAbierto ? '-translate-y-[6.5px] -rotate-45' : ''}`} />
        </button>
      </div>

      <aside
        className={`${menuAbierto ? 'flex' : 'hidden'} w-full flex-col justify-between border-b border-graphite-border bg-obsidian px-6 py-6 md:flex md:w-60 md:border-b-0 md:border-r md:py-8`}
      >
        <div>
          <p className="mb-10 hidden font-serif text-base tracking-widest2 text-white md:block">MIRAIA · Admin</p>
          <nav className="flex flex-col gap-1">
            <AdminNavLink href="/admin/">Resumen</AdminNavLink>
            <AdminNavLink href="/admin/productos/">Productos</AdminNavLink>
            <AdminNavLink href="/admin/categorias/">Categorías</AdminNavLink>
            <AdminNavLink href="/admin/blog/">Blog</AdminNavLink>
          </nav>
        </div>
        <div className="mt-8 md:mt-0">
          <p className="mb-3 truncate text-[11px] text-graphite-muted">{adminEmail}</p>
          <LogoutButton />
        </div>
      </aside>

      <main className="flex-1 px-5 py-8 md:px-10 md:py-10">{children}</main>
    </div>
  );
}

function AdminNavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="rounded px-3 py-2 text-sm text-graphite-muted hover:bg-graphite hover:text-white">
      {children}
    </Link>
  );
}
