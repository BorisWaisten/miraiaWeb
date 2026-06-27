'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { apiSendJson } from '@/lib/api';

/** Login del panel de administración. Única página de /admin que no requiere sesión. */
export default function AdminLoginPage() {
  const router = useRouter();
  const [destino, setDestino] = useState('/admin/');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Lee ?from=... manualmente (en vez de useSearchParams) para no necesitar
  // un boundary de Suspense en una build estática (`output: 'export'`).
  useEffect(() => {
    const from = new URLSearchParams(window.location.search).get('from');
    if (from) setDestino(from);
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await apiSendJson<{ admin: { email: string } }>('/admin/login.php', { email, password });

    if (!res.ok) {
      setError(res.error ?? 'No se pudo iniciar sesión.');
      setLoading(false);
      return;
    }

    router.push(destino);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-graphite px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm border border-graphite-border bg-graphite p-10">
        <p className="mb-1 text-[10px] uppercase tracking-widest2 text-bronze">Panel privado</p>
        <h1 className="mb-8 font-serif text-2xl font-medium text-white">Acceso administrador</h1>

        <label className="mb-1.5 block text-[11px] uppercase tracking-wide text-graphite-muted">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-5 w-full border border-graphite-border bg-transparent px-4 py-2.5 text-sm text-white outline-none focus:border-bronze"
        />

        <label className="mb-1.5 block text-[11px] uppercase tracking-wide text-graphite-muted">Contraseña</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-6 w-full border border-graphite-border bg-transparent px-4 py-2.5 text-sm text-white outline-none focus:border-bronze"
        />

        {error && <p className="mb-5 text-xs text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-bronze py-3 text-[11px] uppercase tracking-wide text-obsidian disabled:opacity-60"
        >
          {loading ? 'Ingresando…' : 'Ingresar'}
        </button>
      </form>
    </div>
  );
}
