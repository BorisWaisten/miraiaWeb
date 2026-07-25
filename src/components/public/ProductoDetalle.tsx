'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { obtenerImagenesVariante } from '@/lib/api';
import { LINEAS, parseEspecificaciones, type Producto } from '@/models/producto';
import type { Variante } from '@/models/variante';

/**
 * Detalle de producto — UI compartida entre la página estática
 * /alfombras-modulares/[slug]/ (SEO, datos en el HTML del build) y el
 * fallback client-side /productos/ver/ (productos creados post-build).
 * Breadcrumb visible = ítem 14 del doc SEO del cliente.
 */
export function ProductoDetalle({ producto }: { producto: Producto }) {
  return (
    <>
      <nav aria-label="Breadcrumb" className="text-[11px] uppercase tracking-wide text-graphite-muted">
        <Link href="/" className="hover:text-bronze">Inicio</Link>
        <span className="mx-2">›</span>
        <Link href="/productos/" className="hover:text-bronze">Productos</Link>
        <span className="mx-2">›</span>
        <span className="text-bronze">{producto.nombre}</span>
      </nav>

      <div className="mt-8 grid grid-cols-1 gap-12 md:grid-cols-2">
        <Carrusel producto={producto} />

        <div>
          {/* Jerarquía tipográfica del Manual de Identidad: Título (serif) →
              Subtítulo (uppercase espaciado, gris — el bronce se reserva para CTAs) →
              Cuerpo. */}
          <h1 className="font-serif text-3xl font-medium text-white md:text-4xl">
            {producto.nombre}
          </h1>
          {producto.subtitulo && (
            <p className="mt-3 text-[11px] uppercase tracking-widest2 text-graphite-muted">
              {producto.subtitulo}
            </p>
          )}
          {producto.descripcionCorta && (
            <p className="mt-6 text-base leading-relaxed text-ivory">
              {producto.descripcionCorta}
            </p>
          )}
          <Especificaciones producto={producto} />
          {producto.descripcionLarga && (
            <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-graphite-muted">
              {producto.descripcionLarga}
            </p>
          )}
          {(producto.certificados ?? []).length > 0 && (
            <div className="mt-8">
              <p className="mb-3 text-[11px] uppercase tracking-widest2 text-graphite-muted">
                Certificados
              </p>
              <ul className="space-y-1.5">
                {producto.certificados.map((cert) => (
                  <li key={cert.ruta}>
                    <a
                      href={cert.ruta}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-bronze underline-offset-4 hover:underline"
                    >
                      {cert.nombre} (PDF)
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/** Specs técnicas en tabla estructurada (doc SEO ítem 03 — nunca texto corrido). */
function Especificaciones({ producto }: { producto: Producto }) {
  const specs = parseEspecificaciones(producto.especificaciones);
  if (specs.length === 0) return null;
  return (
    <div className="mt-8">
      <p className="mb-3 text-[11px] uppercase tracking-widest2 text-graphite-muted">
        Especificaciones técnicas
      </p>
      <table className="w-full border-collapse text-sm">
        <tbody>
          {specs.map(([clave, valor]) => (
            <tr key={clave} className="border-b border-graphite-border">
              <th scope="row" className="w-2/5 py-2.5 pr-4 text-left font-normal text-graphite-muted">
                {clave}
              </th>
              <td className="py-2.5 text-ivory">{valor}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Carrusel: una imagen visible, flechas + miniaturas para cambiar.
 * Si el producto tiene variantes de color, se agrega un selector arriba; al
 * elegir una se resuelven sus imágenes contra Cloudinary (categoria.slug +
 * variante.slug — migración 007). Sin variantes o sin categoría asignada,
 * el carrusel muestra solo la imagen principal.
 */
function Carrusel({ producto }: { producto: Producto }) {
  // `?? []`: una API vieja (pre-migración 007) no manda variantes.
  const variantes = producto.variantes ?? [];
  const [varianteId, setVarianteId] = useState<number | null>(variantes[0]?.id ?? null);
  const [imagenesVariante, setImagenesVariante] = useState<string[] | null>(null);
  const [cargando, setCargando] = useState(false);
  const [indice, setIndice] = useState(0);
  // URLs que dieron error de carga (ej. un export estático viejo con una ruta
  // de imagen que ya no existe en el servidor) — se descartan para no mostrar
  // el ícono de imagen rota.
  const [urlsRotas, setUrlsRotas] = useState<Set<string>>(new Set());
  function marcarRota(src: string) {
    setUrlsRotas((prev) => (prev.has(src) ? prev : new Set(prev).add(src)));
  }

  const varianteActual: Variante | null =
    variantes.find((v) => v.id === varianteId) ?? null;

  useEffect(() => {
    setIndice(0);
    if (!varianteActual || !producto.categoria) {
      setImagenesVariante(null);
      return;
    }
    let cancelado = false;
    setCargando(true);
    obtenerImagenesVariante(producto.categoria.slug, varianteActual.slug).then((res) => {
      if (cancelado) return;
      setImagenesVariante(res.data ?? []);
      setCargando(false);
    });
    return () => {
      cancelado = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [varianteActual?.id, producto.categoria?.slug]);

  const candidatas =
    imagenesVariante && imagenesVariante.length > 0
      ? imagenesVariante
      : ([producto.imagenPrincipal].filter(Boolean) as string[]);
  const imagenes = candidatas.filter((src) => !urlsRotas.has(src));
  const indiceSeguro = Math.min(indice, Math.max(0, imagenes.length - 1));

  // ALT descriptivo con keyword + marca (ítem 09 del doc SEO)
  const etiqueta = (LINEAS[producto.linea]?.etiqueta ?? 'Alfombra Modular').toLowerCase();
  const altBase = `${producto.nombre} — ${varianteActual?.nombre ?? producto.subtitulo ?? etiqueta} — Miraia`;

  return (
    <div>
      {variantes.length > 1 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {variantes.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => setVarianteId(v.id)}
              className={`border px-3 py-1.5 text-[11px] uppercase tracking-wide ${
                v.id === varianteId
                  ? 'border-bronze text-bronze'
                  : 'border-graphite-border text-graphite-muted hover:border-bronze hover:text-bronze'
              }`}
            >
              {v.nombre}
            </button>
          ))}
        </div>
      )}

      {imagenes.length === 0 && !cargando ? (
        <div className="flex h-[420px] items-center justify-center bg-graphite-tile text-xs text-graphite-muted">
          Sin imágenes
        </div>
      ) : (
        <div className="relative h-[420px] bg-graphite-tile">
          {cargando ? (
            <div className="flex h-full items-center justify-center text-xs text-graphite-muted">
              Cargando imágenes…
            </div>
          ) : (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imagenes[indiceSeguro] ?? ''}
                alt={`${altBase} (imagen ${indiceSeguro + 1} de ${imagenes.length})`}
                className="h-full w-full object-cover"
                onError={() => marcarRota(imagenes[indiceSeguro] ?? '')}
              />
              {imagenes.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setIndice((i) => (i - 1 + imagenes.length) % imagenes.length)}
                    className="absolute left-0 top-0 h-full bg-gradient-to-r from-black/40 to-transparent px-3 text-2xl text-white/70 hover:text-white"
                    title="Anterior"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={() => setIndice((i) => (i + 1) % imagenes.length)}
                    className="absolute right-0 top-0 h-full bg-gradient-to-l from-black/40 to-transparent px-3 text-2xl text-white/70 hover:text-white"
                    title="Siguiente"
                  >
                    ›
                  </button>
                  <p className="absolute bottom-3 right-3 bg-black/60 px-2 py-0.5 text-[10px] text-white">
                    {indiceSeguro + 1} / {imagenes.length}
                  </p>
                </>
              )}
            </>
          )}
        </div>
      )}

      {!cargando && imagenes.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {imagenes.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setIndice(i)}
              className={`h-16 w-16 flex-shrink-0 border ${
                i === indiceSeguro ? 'border-bronze' : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-full w-full object-cover" onError={() => marcarRota(src)} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
