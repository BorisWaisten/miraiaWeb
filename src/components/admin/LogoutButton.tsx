'use client';

import { useRouter } from 'next/navigation';
import { apiSendJson, invalidarSesionAdmin } from '@/lib/api';

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await apiSendJson('/admin/logout.php', {});
    invalidarSesionAdmin();
    router.push('/admin/login/');
  }

  return (
    <button
      onClick={handleLogout}
      className="w-full border border-graphite-border py-2 text-[11px] uppercase tracking-wide text-graphite-muted hover:border-bronze hover:text-bronze"
    >
      Cerrar sesión
    </button>
  );
}
