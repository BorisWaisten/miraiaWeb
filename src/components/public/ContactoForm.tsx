'use client';

import { useEffect, useState } from 'react';
import { apiGet } from '@/lib/api';
import type { Producto } from '@/models/producto';

const WHATSAPP_NUMERO = '5493446575620';

type Modo = 'consulta' | 'presupuesto';

/**
 * Formulario comercial con dos modalidades — "realizar consulta" y "pedir
 * presupuesto" — que arman un mensaje y redirigen a WhatsApp (wa.me), en vez
 * de enviar por mail (php-api/contacto.php ya no se usa desde acá).
 * Las opciones de "tipo de producto" se derivan de las categorías reales
 * cargadas en el admin, leyendo el listado público de productos.
 */
export function ContactoForm() {
  const [modo, setModo] = useState<Modo>('consulta');
  const [categorias, setCategorias] = useState<string[]>([]);

  const [nombre, setNombre] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [metrosCuadrados, setMetrosCuadrados] = useState('');
  const [tipoProducto, setTipoProducto] = useState('');
  const [comentario, setComentario] = useState('');

  useEffect(() => {
    apiGet<Producto[]>('/productos.php').then((res) => {
      const nombres = (res.data ?? [])
        .map((p) => p.categoria?.nombre)
        .filter((n): n is string => Boolean(n));
      setCategorias([...new Set(nombres)].sort((a, b) => a.localeCompare(b)));
    });
  }, []);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const lineas =
      modo === 'consulta'
        ? [
            'Hola, quiero hacer una consulta.',
            `Nombre: ${nombre}`,
            empresa.trim() !== '' ? `Empresa: ${empresa}` : null,
            '',
            mensaje,
          ]
        : [
            'Hola, quiero pedir un presupuesto.',
            `Nombre: ${nombre}`,
            empresa.trim() !== '' ? `Empresa: ${empresa}` : null,
            `Metros cuadrados: ${metrosCuadrados} m²`,
            `Tipo de producto: ${tipoProducto}`,
            comentario.trim() !== '' ? `\nComentario: ${comentario}` : null,
          ];

    const texto = lineas.filter((l) => l !== null).join('\n');
    const url = `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(texto)}`;

    (window as { gtag?: (...args: unknown[]) => void }).gtag?.('event', 'generate_lead', {
      event_category: 'contacto',
      event_label: modo === 'consulta' ? 'realizar_consulta' : 'pedir_presupuesto',
    });

    window.open(url, '_blank', 'noopener,noreferrer');
  }

  const inputClass =
    'w-full border border-graphite-border bg-graphite-tile px-4 py-3 text-sm text-white placeholder:text-graphite-muted focus:border-bronze focus:outline-none';

  return (
    <div className="mt-8">
      <div className="flex border border-graphite-border">
        <ModoTab activo={modo === 'consulta'} onClick={() => setModo('consulta')}>
          Realizar consulta
        </ModoTab>
        <ModoTab activo={modo === 'presupuesto'} onClick={() => setModo('presupuesto')}>
          Pedir presupuesto
        </ModoTab>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
          minLength={2}
          maxLength={160}
          placeholder="Nombre *"
          className={inputClass}
        />
        <input
          value={empresa}
          onChange={(e) => setEmpresa(e.target.value)}
          maxLength={160}
          placeholder="Estudio / Empresa"
          className={inputClass}
        />

        {modo === 'consulta' ? (
          <textarea
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            required
            maxLength={5000}
            rows={5}
            placeholder="Contanos sobre tu proyecto *"
            className={inputClass}
          />
        ) : (
          <>
            <input
              value={metrosCuadrados}
              onChange={(e) => setMetrosCuadrados(e.target.value)}
              type="number"
              min={1}
              step="0.01"
              required
              placeholder="Metros cuadrados *"
              className={inputClass}
            />
            <select
              value={tipoProducto}
              onChange={(e) => setTipoProducto(e.target.value)}
              required
              className={inputClass}
            >
              <option value="" disabled>
                Tipo de producto *
              </option>
              {categorias.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <textarea
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              maxLength={5000}
              rows={4}
              placeholder="Comentario adicional (opcional)"
              className={inputClass}
            />
          </>
        )}

        <button
          type="submit"
          className="bg-bronze px-7 py-3 text-[11px] uppercase tracking-wide text-obsidian"
        >
          {modo === 'consulta' ? 'Enviar consulta por WhatsApp' : 'Pedir presupuesto por WhatsApp'}
        </button>
      </form>
    </div>
  );
}

function ModoTab({
  activo,
  onClick,
  children,
}: {
  activo: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 px-4 py-3 text-[11px] uppercase tracking-wide transition-colors ${
        activo ? 'bg-bronze text-obsidian' : 'text-graphite-muted hover:text-white'
      }`}
    >
      {children}
    </button>
  );
}
