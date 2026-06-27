/** Forma de "Proyecto" tal cual la devuelve php-api/proyectos.php. */
export interface Proyecto {
  id: number;
  slug: string;
  nombre: string;
  etiqueta: string;
  imagen: string | null;
  esPrincipal: boolean;
  orden: number;
}
