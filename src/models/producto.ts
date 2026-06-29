/**
 * Modelo de dominio "Producto" — catálogo de exhibición MIRAIA.
 * IMPORTANTE: no contiene campo de precio (sitio B2B de exhibición).
 *
 * Desde la migración 001, las categorías son dinámicas (tabla `catalogos`).
 * El modelo ya no usa el ENUM fijo `categoria`; en su lugar incluye
 * `catalogoId`, `catalogoSlug` y `catalogoNombre` que provienen del JOIN
 * que hace la API PHP al leer productos.
 *
 * Coincide 1:1 con Productos::mapRow() en php-api/lib/Productos.php.
 */

/** Especificaciones técnicas — estructura libre pero tipada. */
export interface EspecificacionesProducto {
  material?: string;
  dimensiones?: string;
  espesor?: string;
  resistencia?: string;
  instalacion?: string;
  [key: string]: string | undefined;
}

/** Forma tal cual la devuelve la API PHP. */
export interface Producto {
  id: number;
  slug: string;
  nombre: string;
  /** ID del catálogo al que pertenece */
  catalogoId: number;
  /** Slug del catálogo (para filtros de URL) */
  catalogoSlug: string;
  /** Nombre legible del catálogo */
  catalogoNombre: string;
  descripcionCorta: string;
  /** HTML limpio generado por el editor Tiptap */
  descripcionLarga: string | null;
  especificaciones: EspecificacionesProducto | null;
  /** Imagen principal (thumbnail en listados) */
  imagenPrincipal: string | null;
  /** Imágenes adicionales — máx. 2 (imágenes 2 y 3) */
  imagenesGaleria: string[];
  destacado: boolean;
  activo: boolean;
  orden: number;
  createdAt: string;
  updatedAt: string;
}
