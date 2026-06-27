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

export async function apiGet<T>(path: string): Promise<ApiResult<T>> {
  const res = await fetch(`${API_BASE_URL}${path}`, { credentials: 'include' });
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
