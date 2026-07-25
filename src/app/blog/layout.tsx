import type { Metadata } from 'next';

// Metadata de /blog/ (la página es 'use client', así que va en un layout).
export const metadata: Metadata = {
  title: 'Blog | Miraia',
  description:
    'Guías, comparativas y criterios de especificación para arquitectura contract — alfombra modular, LVT y piso autoposante.',
  alternates: { canonical: '/blog/' },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
