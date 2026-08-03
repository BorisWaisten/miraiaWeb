/**
 * Cliente fetch centralizado hacia la API PHP.
 *
 * Todo el sitio (público y admin) corre como export estático — sin servidor
 * Next — así que TODA la obtención de datos pasa por aquí, desde componentes
 * cliente ('use client'), nunca desde Server Components.
 *
 * La sesión de admin viaja en una cookie httpOnly que pone PHP (`miraia_session`).
 * `credentials: 'include'` es necesario para que esa cookie se envíe/reciba,
 * sobre todo en desarrollo cuando el front (Next) y la API (PHP) corren en
 * puertos distintos (orígenes distintos).
 */

export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || '/api').replace(/\/$/, '');

export interface ApiResult<T> {
  ok: boolean;
  status: number;
  data?: T;
  error?: string;
}

async function parseResponse<T>(res: Response): Promise<ApiResult<T> & { parseFallo: boolean }> {
  let body: { data?: T; error?: string } = {};
  let parseFallo = false;
  try {
    body = await res.json();
  } catch {
    // Respuestas sin body (ej. 204) — se ignora el parseo. Distinto de una
    // respuesta 2xx que sí trae body pero no es JSON (ver apiGet).
    parseFallo = res.status !== 204;
  }
  return { ok: res.ok, status: res.status, data: body.data, error: body.error, parseFallo };
}

// ── Verificación de sesión admin con caché por pestaña ──
// El layout de /admin se re-monta en cada navegación; sin caché, cada click
// dispara un GET /admin/me.php. Con clicks rápidos eso acumula decenas de
// requests simultáneos y en SiteGround se agota el límite de conexiones MySQL
// (→ 500 "Error interno del servidor"). Acá se hace UNA sola llamada por
// pestaña y las siguientes reutilizan la misma promesa. La protección real
// sigue siendo server-side (Auth::requerirSesion en cada endpoint).
let sesionAdminCache: Promise<ApiResult<{ email: string }>> | null = null;

export function verificarSesionAdmin(): Promise<ApiResult<{ email: string }>> {
  sesionAdminCache ??= apiGet<{ email: string }>('/admin/me.php').then((res) => {
    if (!res.ok) sesionAdminCache = null; // no cachear fallos: reintenta en la próxima navegación
    return res;
  });
  return sesionAdminCache;
}

/** Llamar al hacer login/logout para que la próxima navegación re-verifique. */
export function invalidarSesionAdmin(): void {
  sesionAdminCache = null;
}

// Reintentos en GET: SiteGround interpone un challenge anti-bot (sgcaptcha)
// delante de la API para una porción de los requests que le llegan vía el
// rewrite server-side de Vercel (ven la IP del datacenter de Vercel, no la
// del visitante). Ese challenge responde 2xx con un HTML de redirect en vez
// del JSON esperado, así que a los ojos de fetch() es una respuesta "ok" pero
// no parseable. Es intermitente (no todos los requests lo disparan), así que
// un par de reintentos alcanza para no mostrar secciones vacías al visitante
// mientras se resuelve del lado de hosting (whitelistear /api/* en SiteGround).
const GET_MAX_INTENTOS = 3;

export async function apiGet<T>(path: string): Promise<ApiResult<T>> {
  // Timestamp anti-caché: el caché dinámico de SiteGround indexa por URL y
  // puede servir respuestas viejas de la API. Con esto cada GET la esquiva.
  const sep = path.includes('?') ? '&' : '?';

  let ultimoResultado: ApiResult<T> & { parseFallo: boolean };
  for (let intento = 1; intento <= GET_MAX_INTENTOS; intento++) {
    const res = await fetch(`${API_BASE_URL}${path}${sep}_t=${Date.now()}`, {
      credentials: 'include',
    });
    ultimoResultado = await parseResponse<T>(res);
    const esChallengeAntiBot = ultimoResultado.ok && ultimoResultado.parseFallo;
    if (!esChallengeAntiBot || intento === GET_MAX_INTENTOS) break;
    // Pequeña espera antes de reintentar: pegarle de nuevo sin pausa se parece
    // más al tráfico en ráfaga que dispara el bloqueo, no menos.
    await new Promise((resolve) => setTimeout(resolve, 400 * intento));
  }
  return ultimoResultado!;
}

/**
 * Como apiGet, pero para los endpoints públicos de alto tráfico que tienen un
 * proxy cacheado en /api-cache/* (ver src/app/api-cache/*) — sin timestamp
 * anti-caché a propósito, así Vercel puede compartir la respuesta cacheada
 * entre visitas en vez de pegarle a SiteGround en cada una.
 */
export async function apiGetCached<T>(path: string): Promise<ApiResult<T>> {
  const res = await fetch(`/api-cache${path}`);
  return parseResponse<T>(res);
}

export async function apiSendForm<T>(
  path: string,
  formData: FormData,
  method: 'POST' | 'PUT' = 'POST',
): Promise<ApiResult<T>> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    body: formData,
    credentials: 'include',
  });
  return parseResponse<T>(res);
}

export async function apiSendJson<T>(
  path: string,
  body: unknown,
  method: 'POST' | 'PUT' | 'DELETE' = 'POST',
): Promise<ApiResult<T>> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    credentials: 'include',
  });
  return parseResponse<T>(res);
}

export async function apiDelete<T>(path: string): Promise<ApiResult<T>> {
  const res = await fetch(`${API_BASE_URL}${path}`, { method: 'DELETE', credentials: 'include' });
  return parseResponse<T>(res);
}

/**
 * URL absoluta de un archivo subido (hoy solo certificados PDF). En la base se
 * guardan como ruta relativa al host de la API (`/uploads/productos/x.pdf`),
 * formato que alcanzaba cuando el front y la API compartían dominio. Con el
 * front en Vercel esa ruta apuntaría al dominio del front —donde no existe—
 * así que hay que resolverla contra el origen de la API.
 */
export function urlArchivo(ruta: string): string {
  // Ya absoluta (o API en el mismo origen, como en dev y en el export estático):
  // la ruta tal cual ya resuelve bien.
  if (/^https?:\/\//i.test(ruta) || !/^https?:\/\//i.test(API_BASE_URL)) {
    return ruta;
  }
  return new URL(ruta, API_BASE_URL).href;
}

/**
 * Imágenes de una variante de producto (migración 007), resueltas en runtime
 * contra Cloudinary por el backend (php-api/variante-imagenes.php) a partir
 * del slug de categoría + slug de variante.
 */
export function obtenerImagenesVariante(categoriaSlug: string, varianteSlug: string): Promise<ApiResult<string[]>> {
  const qs = new URLSearchParams({ categoria: categoriaSlug, variante: varianteSlug });
  return apiGet<string[]>(`/variante-imagenes.php?${qs.toString()}`);
}
