'use client';

import { usePathname } from 'next/navigation';
import { whatsappUrl } from '@/lib/contacto';

/**
 * Botón flotante de WhatsApp — fijo abajo a la derecha, persiste en todas las
 * páginas públicas (montado en el layout raíz). Se oculta en /admin/: es el
 * panel interno del cliente, no una página que visiten sus clientes.
 */
export function WhatsAppButton() {
  const pathname = usePathname();
  if (pathname?.startsWith('/admin')) return null;

  return (
    <a
      href={whatsappUrl()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Abrir chat de WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-lg transition-transform hover:scale-105"
    >
      <svg viewBox="0 0 32 32" width="30" height="30" fill="#ffffff" aria-hidden>
        <path d="M16.001 3C9.373 3 4 8.373 4 15c0 2.386.697 4.61 1.902 6.484L4 29l7.7-1.87A11.94 11.94 0 0 0 16.001 27C22.628 27 28 21.627 28 15S22.628 3 16.001 3Zm0 21.818a9.78 9.78 0 0 1-4.99-1.363l-.358-.213-4.57 1.11 1.124-4.457-.234-.372A9.8 9.8 0 0 1 5.2 15c0-5.955 4.846-10.8 10.801-10.8 5.954 0 10.8 4.845 10.8 10.8 0 5.954-4.846 10.818-10.8 10.818Zm5.914-8.096c-.324-.163-1.917-.947-2.214-1.056-.297-.108-.513-.163-.729.163-.216.325-.837 1.056-1.026 1.273-.189.217-.378.244-.702.081-.324-.163-1.367-.504-2.605-1.61-.963-.86-1.613-1.921-1.802-2.246-.189-.325-.02-.5.143-.663.146-.145.324-.379.486-.568.162-.19.216-.325.324-.542.108-.217.054-.406-.027-.569-.081-.163-.729-1.756-.999-2.405-.263-.63-.53-.545-.729-.555l-.621-.011c-.216 0-.567.081-.864.406-.297.325-1.134 1.11-1.134 2.706 0 1.596 1.161 3.138 1.323 3.355.162.217 2.286 3.49 5.539 4.895.774.334 1.377.534 1.848.684.776.247 1.483.212 2.042.129.623-.093 1.917-.784 2.187-1.542.27-.759.27-1.408.189-1.543-.081-.135-.297-.217-.621-.38Z" />
      </svg>
    </a>
  );
}
