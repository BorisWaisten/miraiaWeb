/**
 * Modelo de dominio "Variante" — color/opción de un producto (migración 007).
 * Sin imágenes propias: se resuelven en runtime contra Cloudinary usando
 * categoria.slug + variante.slug (ver src/lib/api.ts → obtenerImagenesVariante).
 * Coincide 1:1 con Variantes::mapRow() en php-api/lib/Variantes.php.
 */
export interface Variante {
  id: number;
  productoId: number;
  nombre: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}
