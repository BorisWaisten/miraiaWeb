import { crearPaginaProducto } from '@/lib/paginaProducto';

// `true` (default): productos creados/renombrados después del build se
// renderizan on-demand en Vercel, en vez de dar 404 hasta el próximo deploy.
// Era `false` de la época de export estático por FTP, donde no había server
// que pudiera renderizar bajo demanda — quedó obsoleto con la migración.
export const dynamicParams = true;
const pagina = crearPaginaProducto('alfombra-modular');
export const generateStaticParams = pagina.generateStaticParams;
export const generateMetadata = pagina.generateMetadata;
export default pagina.PaginaProducto;
