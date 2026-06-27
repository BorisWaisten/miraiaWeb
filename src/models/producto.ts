/**
 * Modelo de dominio "Producto" — catálogo de exhibición MIRAIA.
 * IMPORTANTE: este modelo NO contiene campo de precio a propósito.
 * El sitio público es solo de exhibición/consulta para arquitectos y estudios B2B.
 *
 * Esta forma coincide 1:1 con lo que devuelve la API PHP (php-api/lib/Productos.php
 * → mapRow), que ya entrega los datos en camelCase listos para consumir.
 */

export const CATEGORIAS_PRODUCTO = [
  'piso_tecnico',
  'alfombra_modular',
  'vinilico_lvt',
] as const;

export type CategoriaProducto = (typeof CATEGORIAS_PRODUCTO)[number];

export const CATEGORIA_LABEL: Record<CategoriaProducto, string> = {
  piso_tecnico: 'Piso técnico',
  alfombra_modular: 'Alfombra modular',
  vinilico_lvt: 'Vinílico LVT',
};

/** Especificaciones técnicas — estructura libre pero tipada en el frontend. */
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
  categoria: CategoriaProducto;
  descripcionCorta: string;
  descripcionLarga: string | null;
  especificaciones: EspecificacionesProducto | null;
  imagenPrincipal: string | null;
  destacado: boolean;
  activo: boolean;
  orden: number;
  createdAt: string;
  updatedAt: string;
}
