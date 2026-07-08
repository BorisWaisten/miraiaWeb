/**
 * Modelo de dominio "Producto" — exhibición MIRAIA.
 * Desde la migración 003 un producto es una serie: nombre + imagen principal
 * + galería de imágenes (variantes). Sin precio, catálogos ni descripciones.
 *
 * Coincide 1:1 con Productos::mapRow() en php-api/lib/Productos.php.
 */
export interface Producto {
  id: number;
  slug: string;
  nombre: string;
  subtitulo: string | null;
  descripcionCorta: string | null;
  /** Texto plano; los saltos de línea se respetan al renderizar */
  descripcionLarga: string | null;
  /** Imagen principal (thumbnail en listados) */
  imagenPrincipal: string | null;
  /** Galería de imágenes (variantes de la serie) */
  imagenesGaleria: string[];
  destacado: boolean;
  activo: boolean;
  orden: number;
  createdAt: string;
  updatedAt: string;
}
