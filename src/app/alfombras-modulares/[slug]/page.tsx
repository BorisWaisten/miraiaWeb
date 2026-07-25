import { crearPaginaProducto } from '@/lib/paginaProducto';

export const dynamicParams = false;
const pagina = crearPaginaProducto('alfombra-modular');
export const generateStaticParams = pagina.generateStaticParams;
export const generateMetadata = pagina.generateMetadata;
export default pagina.PaginaProducto;
