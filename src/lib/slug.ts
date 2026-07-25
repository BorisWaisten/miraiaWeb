/**
 * Preview de slug en el cliente (nombre → slug), solo para mostrarle al
 * admin qué slug va a quedar. El slug real y definitivo lo genera el backend
 * (Categorias::generarSlugUnico / Variantes::generarSlugUnico), que además
 * resuelve colisiones agregando un sufijo numérico.
 */
export function slugify(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // quita acentos (tildes, diéresis) tras normalizar
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
