'use client';

import { useState } from 'react';
import { apiSendJson } from '@/lib/api';

/**
 * Formulario comercial → POST /api/contacto.php (envía mail).
 * Al enviar OK dispara el evento de conversión de GA4 pedido por el
 * doc SEO del cliente (ítem 04): "generate_lead".
 */
export function ContactoForm() {
  const [estado, setEstado] = useState<'idle' | 'enviando' | 'ok' | 'error'>('idle');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEstado('enviando');
    const form = new FormData(e.currentTarget);
    const res = await apiSendJson('/contacto.php', Object.fromEntries(form));
    if (res.ok) {
      setEstado('ok');
      (window as { gtag?: (...args: unknown[]) => void }).gtag?.('event', 'generate_lead', {
        event_category: 'contacto',
        event_label: 'solicitar_catalogo',
      });
    } else {
      setEstado('error');
    }
  }

  if (estado === 'ok') {
    return (
      <p className="mt-8 border border-bronze/40 bg-graphite-tile px-6 py-5 text-sm text-ivory">
        Gracias por tu consulta. Te respondemos dentro de las próximas 48h hábiles.
      </p>
    );
  }

  const inputClass =
    'w-full border border-graphite-border bg-graphite-tile px-4 py-3 text-sm text-white placeholder:text-graphite-muted focus:border-bronze focus:outline-none';

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-4">
      <input name="nombre" required minLength={2} maxLength={160} placeholder="Nombre *" className={inputClass} />
      <input name="empresa" maxLength={160} placeholder="Estudio / Empresa" className={inputClass} />
      <input name="email" type="email" required placeholder="Email *" className={inputClass} />
      <textarea name="mensaje" required maxLength={5000} rows={5} placeholder="Contanos sobre tu proyecto *" className={inputClass} />
      <button
        type="submit"
        disabled={estado === 'enviando'}
        className="bg-bronze px-7 py-3 text-[11px] uppercase tracking-wide text-obsidian disabled:opacity-60"
      >
        {estado === 'enviando' ? 'Enviando…' : 'Enviar consulta'}
      </button>
      {estado === 'error' && (
        <p className="text-sm text-red-400">
          No se pudo enviar. Probá de nuevo o escribinos a info@miraia.com.ar.
        </p>
      )}
    </form>
  );
}
