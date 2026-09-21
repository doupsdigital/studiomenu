/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        rose: {
          50: '#fdf8f9',
          100: '#f9eef1',
          200: '#f3dae1',
          300: '#e8b8c7',
          400: '#d88ba2',
          500: '#c46884',
          600: '#b04e6c',
          700: '#923c56',
          800: '#793448',
          900: '#663040',
          950: '#3c1622',
        },
        luxury: {
          gold: '#d4af37',
          'gold-light': '#f3e5ab',
          'gold-dark': '#aa820a',
          dark: '#0d0d0d',
          card: '#161618',
          border: '#2a2a2e',
        },
        // Paleta neutra clara do app da profissional (/app/[slug]) — extensão
        // aditiva, não mexe em nada existente. Inspirada no fundo creme/cards
        // brancos do LashAgenda (docs/REESTRUTURACAO_VISUAL_APP.md), mas com
        // a cor de destaque continuando a ser `rose` (já definida acima).
        cream: '#F3F5F8',
        surface: '#FFFFFF',
        linen: '#E7E9EE',
        ink: {
          DEFAULT: '#2C1810',
          soft: '#6B5D53',
          faint: '#A8998C',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(196, 104, 132, 0.12)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.4)',
        'gold-glow': '0 0 20px rgba(212, 175, 55, 0.25)',
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
};
