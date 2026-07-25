import type { Categoria } from './categoria';
import type { Variante } from './variante';

/**
 * Modelo de dominio "Producto" — exhibición MIRAIA.
 * Desde la migración 003 un producto es una serie: nombre + imagen principal
 * + descripciones. Sin precio. Desde la migración 007 pertenece a una
 * categoría y puede tener variantes de color, cuyas imágenes se resuelven en
 * runtime contra Cloudinary (no hay galería fija en la DB).
 *
 * Coincide 1:1 con Productos::mapRow() en php-api/lib/Productos.php.
 */
export type LineaProducto = 'alfombra-modular' | 'piso-tecnico';

/** Config por línea de negocio: prefijo de URL pública y textos SEO. */
export const LINEAS: Record<LineaProducto, { prefijo: string; etiqueta: string; plural: string }> = {
  'alfombra-modular': { prefijo: 'alfombras-modulares', etiqueta: 'Alfombra Modular', plural: 'Alfombras Modulares' },
  'piso-tecnico': { prefijo: 'pisos-tecnicos', etiqueta: 'Piso Técnico', plural: 'Pisos Técnicos' },
};

/** URL canónica del detalle (ítem 07 del doc SEO), según la línea. */
export function urlProducto(p: Pick<Producto, 'slug' | 'linea'>): string {
  const { prefijo } = LINEAS[p.linea] ?? LINEAS['alfombra-modular'];
  return `/${prefijo}/${p.slug}/`;
}

/**
 * Parsea `especificaciones` (una "Clave: Valor" por línea) a pares.
 * Las líneas sin ":" se ignoran. Doc SEO ítem 03: specs siempre en tabla.
 */
export function parseEspecificaciones(texto: string | null | undefined): [string, string][] {
  return (texto ?? '')
    .split('\n')
    .map((linea) => {
      const i = linea.indexOf(':');
      return i > 0 ? ([linea.slice(0, i).trim(), linea.slice(i + 1).trim()] as [string, string]) : null;
    })
    .filter((par): par is [string, string] => par !== null && par[1] !== '');
}

export interface Producto {
  id: number;
  slug: string;
  nombre: string;
  /** Línea de negocio (migración 005) — define la URL pública */
  linea: LineaProducto;
  /** Categoría (migración 007) — junto con la variante define la carpeta de Cloudinary */
  categoriaId: number | null;
  categoria: Categoria | null;
  /** Variantes de color de la serie (migración 007) */
  variantes: Variante[];
  subtitulo: string | null;
  descripcionCorta: string | null;
  /** Texto plano; los saltos de línea se respetan al renderizar */
  descripcionLarga: string | null;
  /** Specs técnicas (migración 006): una "Clave: Valor" por línea → tabla */
  especificaciones: string | null;
  /** Imagen principal (thumbnail en listados) */
  imagenPrincipal: string | null;
  /** Certificados PDF adjuntos (migración 006) */
  certificados: { nombre: string; ruta: string }[];
  destacado: boolean;
  activo: boolean;
  orden: number;
  createdAt: string;
  updatedAt: string;
}
