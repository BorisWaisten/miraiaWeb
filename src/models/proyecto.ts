/**
 * Forma de "Proyecto" tal cual la devuelve php-api/proyectos.php.
 * Coincide 1:1 con Proyectos::mapRow() en php-api/lib/Proyectos.php.
 */
export interface Proyecto {
  id: number;
  slug: string;
  nombre: string;
  etiqueta: string;
  /** Quién encargó el proyecto (ej. "Arq. Estudio Bavera") — opcional, migración 013 */
  cliente: string | null;
  imagen: string | null;
  esPrincipal: boolean;
  activo: boolean;
  orden: number;
  createdAt: string;
  updatedAt: string;
}
