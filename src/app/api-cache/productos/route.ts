import { NextResponse } from 'next/server';

const ORIGIN = process.env.BUILD_API_BASE_URL ?? 'https://api.miraia.com.ar/api';

/**
 * Proxy cacheado de /productos.php — el catálogo se pide en casi todas las
 * visitas (home, /productos/, fallback de detalle) y antes cada una disparaba
 * un fetch nuevo sin caché contra SiteGround (con timestamp anti-caché). Ese
 * volumen de requests seguidos es lo que terminó gatillando el AntiBot/CAPTCHA
 * del hosting. Con esto, Vercel comparte una misma respuesta cacheada entre
 * todas las visitas dentro de la ventana de revalidación — como mucho un
 * request real llega a SiteGround cada 30s, sin importar cuánta gente entre.
 */
export async function GET() {
  const res = await fetch(`${ORIGIN}/productos.php`, { next: { revalidate: 30 } });
  const body = await res.text();
  return new NextResponse(body, {
    status: res.status,
    headers: { 'content-type': res.headers.get('content-type') ?? 'application/json' },
  });
}
