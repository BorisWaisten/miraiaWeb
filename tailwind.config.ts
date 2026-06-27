import type { Config } from 'tailwindcss';

// Paleta y tipografía extraídas a rajatabla del Manual de Identidad de Marca MIRAIA (Mayo 2025).
// El bronce (#C8A96E) es el único color de acento permitido — reservado para CTAs y detalles.
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        obsidian: '#111111', // Fondo principal, tipografía
        graphite: '#2C2C2A', // Fondo logo, secciones oscuras
        cement: '#5F5E5A', // Cuerpo de texto secundario
        mist: '#D3D1C7', // Bordes, separadores
        ivory: '#F1EFE8', // Fondos claros, sección proyectos
        bronze: '#C8A96E', // Acento único — CTAs, detalles
        // Tonos auxiliares tomados del HTML lineal de referencia (variaciones de grafito/cemento).
        'graphite-border': '#444441',
        'graphite-muted': '#888780',
        'graphite-tile': '#1a1a18',
      },
      fontFamily: {
        serif: ['var(--font-serif)'],
        sans: ['var(--font-sans)'],
      },
      letterSpacing: {
        widest2: '0.2em',
        widest3: '0.26em',
      },
    },
  },
  plugins: [],
};

export default config;
