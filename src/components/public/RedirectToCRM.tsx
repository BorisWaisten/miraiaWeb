'use client';

import { useEffect } from 'react';
import { CRM_URL } from '@/lib/contacto';

/**
 * El sitio ya no tiene formulario de contacto propio — el cliente centraliza
 * consultas y presupuestos en un CRM aparte. Esto cubre bookmarks/links
 * viejos a /contacto/: en vez de un 404, redirige al CRM.
 */
export function RedirectToCRM() {
  useEffect(() => {
    window.location.replace(CRM_URL);
  }, []);

  return (
    <p className="text-sm text-graphite-muted">
      Redirigiendo… si no ocurre automáticamente,{' '}
      <a href={CRM_URL} className="text-bronze underline-offset-4 hover:underline">
        hacé clic acá
      </a>
      .
    </p>
  );
}
