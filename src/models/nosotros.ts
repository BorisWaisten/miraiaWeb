/**
 * Modelo de dominio "SeccionNosotros" (migración 011).
 * Bloque libre de la página /nosotros/: título, subtítulo opcional, cuerpo de
 * texto e imagen opcional. Sin imagen → el frontend no reserva espacio para
 * ella (ver src/app/nosotros/page.tsx).
 *
 * Coincide 1:1 con NosotrosSecciones::mapRow() en php-api/lib/NosotrosSecciones.php.
 */
export interface SeccionNosotros {
  id: number;
  titulo: string;
  subtitulo: string | null;
  body: string;
  imagenUrl: string | null;
  activo: boolean;
  orden: number;
  createdAt: string;
  updatedAt: string;
}
