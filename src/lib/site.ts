/**
 * Constante de sitio compartida entre server y client components.
 * Separada de src/lib/seo.ts (que además trae fetches de build-time hacia la
 * API PHP) para poder importarla también desde 'use client' sin arrastrarlos.
 */
export const SITE_URL = 'https://miraia.com.ar';
