import type { Metadata } from 'next';

// Metadata de /nosotros/ (la página es 'use client' para poder traer las
// secciones cargadas desde el admin, así que va en un layout aparte).
export const metadata: Metadata = {
  title: 'Nosotros — Superficies de Autor para Arquitectura Contract | Miraia',
  description:
    'Miraia es una marca premium de superficies para arquitectura contract: alfombras modulares y pisos técnicos con certificación internacional. Buenos Aires.',
  alternates: { canonical: '/nosotros/' },
};

export default function NosotrosLayout({ children }: { children: React.ReactNode }) {
  return children;
}
