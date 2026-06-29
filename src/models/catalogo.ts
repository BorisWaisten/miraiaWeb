/**
 * Modelo de dominio "Catálogo" — categorías dinámicas de productos MIRAIA.
 * Coincide 1:1 con lo que devuelve la API PHP (Catalogos::mapRow).
 */
export interface Catalogo {
  id: number;
  slug: string;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
  orden: number;
  totalProductos: number;
  createdAt: string;
  updatedAt: string;
}
