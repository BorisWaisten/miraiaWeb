// El cliente centraliza contacto y presupuesto en un CRM aparte — los botones
// de "Contacto" / "Solicitar catálogo" / "Pedir presupuesto" del sitio ya no
// abren un formulario propio, redirigen ahí.
export const CRM_URL = 'https://miraia3.netlify.app/';

export const WHATSAPP_NUMERO = '5491124868168';

export function whatsappUrl(texto?: string) {
  const base = `https://wa.me/${WHATSAPP_NUMERO}`;
  return texto ? `${base}?text=${encodeURIComponent(texto)}` : base;
}
