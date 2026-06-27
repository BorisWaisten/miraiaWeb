import type { Metadata } from 'next';
import { Playfair_Display, Inter } from 'next/font/google';
import './globals.css';

/**
 * Tipografías: el manual de marca pide "serif para títulos display,
 * sans-serif para cuerpo y UI" sin fijar una tipografía comercial exacta.
 * Se eligen Playfair Display (serif editorial, alto contraste, acorde al
 * tono premium/arquitectónico) e Inter (sans neutra, muy legible en UI).
 * Si el cliente define tipografías propietarias más adelante, alcanza con
 * reemplazar estos dos imports — el resto del sistema usa siempre
 * `font-serif` / `font-sans` (Tailwind) y nunca un font-family hardcodeado.
 */
const fontSerif = Playfair_Display({
  subsets: ['latin'],
  weight: ['500', '600'],
  variable: '--font-serif',
  display: 'swap',
});

const fontSans = Inter({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'MIRAIA — Superficies de autor para arquitectura contract',
  description:
    'Piso técnico, alfombra modular y vinílico LVT para arquitectura contract, oficinas y espacios de trabajo de autor.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR" className={`${fontSerif.variable} ${fontSans.variable}`}>
      <body className="font-sans bg-graphite text-white antialiased">{children}</body>
    </html>
  );
}
