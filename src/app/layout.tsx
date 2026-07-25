import type { Metadata } from 'next';
import Script from 'next/script';
import { Playfair_Display, Inter } from 'next/font/google';
import { SITE_URL } from '@/lib/seo';
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

// Título y description de Home según doc SEO del cliente (ítems 01 y 12).
// metadataBase hace que los canonical relativos salgan absolutos (ítem 15).
const TITULO = 'Alfombras Modulares y Piso Técnico para Arquitectura Contract | Miraia';
const DESCRIPCION =
  'Alfombras modulares y piso técnico para arquitectura contract. Atención directa a arquitectos. Presupuesto en 48h. Stock en Buenos Aires.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITULO,
  description: DESCRIPCION,
  alternates: { canonical: '/' },
  // Favicon/ícono: no hay logo del cliente como imagen, se generó a partir
  // de la misma marca en SVG que usan SiteNav/SiteFooter (public/favicon.svg).
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  // Vista previa al compartir el link (WhatsApp, Slack, redes) — mismo mark + tagline.
  openGraph: {
    title: TITULO,
    description: DESCRIPCION,
    url: SITE_URL,
    siteName: 'Miraia',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Miraia — Superficies de autor para arquitectura contract' }],
    locale: 'es_AR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: TITULO,
    description: DESCRIPCION,
    images: ['/og-image.png'],
  },
  // Verificación de Google Search Console (ítem 03) — setear el token en .env
  ...(process.env.NEXT_PUBLIC_GSC_TOKEN && {
    verification: { google: process.env.NEXT_PUBLIC_GSC_TOKEN },
  }),
};

// Google Analytics 4 (ítem 04) — sin ID no se inyecta nada (dev/preview).
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR" className={`${fontSerif.variable} ${fontSans.variable}`}>
      <body className="font-sans bg-graphite text-white antialiased">
        {children}
        {GA_ID && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
            <Script id="ga4" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}');`}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
