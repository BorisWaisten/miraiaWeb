'use client';

import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { cldOptimizar } from '@/lib/cloudinary';
import type { Producto } from '@/models/producto';

interface Props {
  productos?: Producto[];
}

export function Hero({ productos = [] }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);
  const [hoveredSlot, setHoveredSlot] = useState<number | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  const imgProductos = productos.filter((p) => p.imagenPrincipal).slice(0, 4);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = panelRef.current?.getBoundingClientRect();
    if (!rect) return;
    const nx = (e.clientX - rect.left) / rect.width;
    const ny = (e.clientY - rect.top) / rect.height;
    setTilt({ x: (ny - 0.5) * -5, y: (nx - 0.5) * 7 });
  }

  // Grid 6 cols × 5 rows — layout editorial asimétrico
  const slots = [
    { col: '1 / 4', row: '1 / 4', delay: 0 },
    { col: '4 / 7', row: '1 / 3', delay: 130 },
    { col: '1 / 4', row: '4 / 6', delay: 260 },
    { col: '4 / 6', row: '3 / 6', delay: 390 },
  ];

  return (
    <div className="grid grid-cols-1 md:h-[560px] md:grid-cols-2">

      {/* ── Izquierda ── */}
      <div className="flex flex-col justify-between border-b border-graphite-border px-8 py-16 md:h-full md:border-b-0 md:border-r md:px-12">
        <div>
          <p className="mb-8 text-[10px] uppercase tracking-widest2 text-bronze">
            Piso técnico · Alfombra modular
          </p>
          <h1 className="mb-6 font-serif text-4xl font-medium leading-tight text-white md:text-[38px]">
            Alfombras Modulares
            <br />
            y Piso Técnico para
            <br />
            Arquitectura Contract
          </h1>
          <p className="mb-10 max-w-[340px] text-[13px] leading-7 text-graphite-muted">
            Materiales de alto rendimiento para arquitectura contract, oficinas y espacios de trabajo de autor.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/productos/" className="bg-bronze px-7 py-3 text-[11px] uppercase tracking-wide text-obsidian">
              Ver productos
            </Link>
            <Link href="/#proyectos" className="text-[11px] uppercase tracking-wide text-graphite-muted hover:text-white">
              Ver proyectos →
            </Link>
          </div>
        </div>
      </div>

      {/* ── Derecha: grid animado — altura propia en mobile, no comparte la de la izquierda ── */}
      <div
        ref={panelRef}
        className="relative h-[380px] overflow-hidden md:h-full"
        style={{ perspective: '1200px' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setTilt({ x: 0, y: 0 })}
      >
        {/* Wrapper 3D tilt — solo este elemento rota */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(6, 1fr)',
            gridTemplateRows: 'repeat(5, 1fr)',
            gap: '1px',
            backgroundColor: '#111110',
            height: '100%',
            width: '100%',
            transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
            transition: 'transform 0.25s ease-out',
            willChange: 'transform',
          }}
        >
          {slots.map((slot, i) => {
            const producto = imgProductos[i];
            const isHovered = hoveredSlot === i;

            return (
              <div
                key={i}
                style={{
                  gridColumn: slot.col,
                  gridRow: slot.row,
                  position: 'relative',
                  overflow: 'hidden',
                  backgroundColor: '#1e1e1c',
                  // Clip-path SOLO para el reveal inicial — no participa en hover
                  clipPath: mounted ? 'inset(0 0 0% 0)' : 'inset(0 0 100% 0)',
                  transition: `clip-path 0.7s cubic-bezier(0.4,0,0.2,1) ${slot.delay}ms`,
                }}
                onMouseEnter={() => setHoveredSlot(i)}
                onMouseLeave={() => setHoveredSlot(null)}
              >
                {producto ? (
                  <>
                    {/*
                      El scale va sobre la IMAGEN (dentro del overflow:hidden del tile),
                      no sobre el tile mismo. Así clip-path y transform nunca interfieren.
                    */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={cldOptimizar(producto.imagenPrincipal!, 700)}
                      alt={producto.nombre}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                        transform: isHovered ? 'scale(1.07)' : 'scale(1)',
                        filter: isHovered
                          ? 'brightness(1.05)'
                          : 'brightness(0.78)',
                        transition: 'transform 0.55s cubic-bezier(0.25,0.46,0.45,0.94), filter 0.4s ease',
                        willChange: 'transform',
                      }}
                    />

                    {/* Overlay: gradiente + texto — fade in suave */}
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)',
                        opacity: isHovered ? 1 : 0,
                        transition: 'opacity 0.4s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-end',
                        padding: '12px',
                        pointerEvents: 'none',
                      }}
                    >
                      <p style={{ fontFamily: 'serif', fontSize: '12px', color: '#fff', lineHeight: 1.3 }}>
                        {producto.nombre}
                      </p>
                    </div>
                  </>
                ) : (
                  <div style={{ width: '100%', height: '100%', backgroundColor: '#1e1e1c' }} />
                )}
              </div>
            );
          })}

          {/* Franja de acento */}
          <div
            style={{
              gridColumn: '6 / 7',
              gridRow: '3 / 6',
              backgroundColor: '#0d0d0c',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              clipPath: mounted ? 'inset(0 0 0% 0)' : 'inset(0 0 100% 0)',
              transition: 'clip-path 0.7s cubic-bezier(0.4,0,0.2,1) 520ms',
            }}
          >
            <p
              style={{
                fontSize: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.2em',
                color: '#444441',
                writingMode: 'vertical-rl',
                transform: 'rotate(180deg)',
              }}
            >
              Colección 2025 — Contract series
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
