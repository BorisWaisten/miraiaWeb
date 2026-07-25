import type { Metadata } from 'next';

// El fallback client-side no debe indexarse: la versión canónica de cada
// posteo es la página estática /blog/<slug>/.
export const metadata: Metadata = { robots: { index: false } };

export default function VerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
