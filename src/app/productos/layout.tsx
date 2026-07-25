import type { Metadata } from 'next';

// Metadata de /productos/ (la página es 'use client', así que va en un layout).
// Textos del doc SEO del cliente (ítems 01 y 12).
export const metadata: Metadata = {
  title: 'Alfombras Modulares para Arquitectura Contract | Miraia',
  description:
    'Series de alfombras modulares y superficies para arquitectura contract. Stock en Buenos Aires y presupuesto en 48h.',
  alternates: { canonical: '/productos/' },
};

export default function ProductosLayout({ children }: { children: React.ReactNode }) {
  return children;
}
