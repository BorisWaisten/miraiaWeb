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

async function parseResponse<T>(res: Response): Promise<ApiResult<T>> {
  let body: { data?: T; error?: string } = {};
  try {
    body = await res.json();
  } catch {
    // Respuestas sin body (ej. 204) — se ignora el parseo.
  }
  return { ok: res.ok, status: res.status, data: body.data, error: body.error };
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

export async function apiGet<T>(path: string): Promise<ApiResult<T>> {
  // Timestamp anti-caché: el caché dinámico de SiteGround indexa por URL y
  // puede servir respuestas viejas de la API. Con esto cada GET la esquiva.
  const sep = path.includes('?') ? '&' : '?';
  const res = await fetch(`${API_BASE_URL}${path}${sep}_t=${Date.now()}`, {
    credentials: 'include',
  });
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
 * Imágenes de una variante de producto (migración 007), resueltas en runtime
 * contra Cloudinary por el backend (php-api/variante-imagenes.php) a partir
 * del slug de categoría + slug de variante.
 */
export function obtenerImagenesVariante(categoriaSlug: string, varianteSlug: string): Promise<ApiResult<string[]>> {
  const qs = new URLSearchParams({ categoria: categoriaSlug, variante: varianteSlug });
  return apiGet<string[]>(`/variante-imagenes.php?${qs.toString()}`);
}
