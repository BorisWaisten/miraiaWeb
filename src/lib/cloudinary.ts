/**
 * Cloudinary sirve las imágenes tal como se subieron (fotos de varios MB,
 * sin comprimir) — PageSpeed lo marca como el mayor problema de LCP del
 * sitio. Las URLs ya vienen resueltas desde php-api (backend), así que en
 * vez de tocarlo ahí, se le insertan transformaciones on-the-fly acá: mismo
 * archivo en Cloudinary, servido con formato moderno (WebP/AVIF) y calidad
 * automática. `c_limit` nunca agranda una imagen más chica que `maxWidth`.
 *
 * URLs que no son de Cloudinary (ej. certificados propios) quedan intactas.
 */
export function cldOptimizar(url: string, maxWidth: number): string {
  const match = url.match(/^(https?:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(.*)$/);
  if (!match) return url;
  const [, base, resto] = match;
  return `${base}f_auto,q_auto,w_${maxWidth},c_limit/${resto}`;
}
