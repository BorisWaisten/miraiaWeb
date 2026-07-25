/**
 * Modelo de dominio "Categoría" — agrupa productos (migración 007).
 * Coincide 1:1 con Categorias::mapRow() en php-api/lib/Categorias.php.
 */
export interface Categoria {
  id: number;
  nombre: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}
