import { NextRequest, NextResponse } from 'next/server';

const ORIGIN = process.env.BUILD_API_BASE_URL ?? 'https://api.miraia.com.ar/api';

/**
 * Proxy cacheado de /proyectos.php — mismo motivo que api-cache/productos.
 * Reenvía `limite` (home pide 3 por default, /proyectos/ pide el listado
 * completo) y cachea cada variante por separado.
 */
export async function GET(request: NextRequest) {
  const limite = request.nextUrl.searchParams.get('limite');
  const url = limite
    ? `${ORIGIN}/proyectos.php?limite=${encodeURIComponent(limite)}`
    : `${ORIGIN}/proyectos.php`;

  const res = await fetch(url, { next: { revalidate: 30 } });
  const body = await res.text();
  return new NextResponse(body, {
    status: res.status,
    headers: { 'content-type': res.headers.get('content-type') ?? 'application/json' },
  });
}
