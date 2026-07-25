import type { Metadata } from 'next';

// El fallback client-side no debe indexarse: la versión canónica de cada
// producto es la página estática /alfombras-modulares/<slug>/.
export const metadata: Metadata = { robots: { index: false } };

export default function VerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
