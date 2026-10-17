/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        kingdom: {
          gold: '#D4A843',
          bronze: '#CD7F32',
          dark: '#0D0D1A',
          darker: '#070710',
          purple: '#2D1B69',
          'purple-light': '#4A2D8A',
          crimson: '#8B1A3D',
          emerald: '#1A6B4A',
          silver: '#C0C0C0',
        }
      },
      fontFamily: {
        display: ['Cinzel', 'serif'],
        body: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-kingdom': 'linear-gradient(135deg, #0D0D1A 0%, #1A0D2E 50%, #0D0D1A 100%)',
        'gradient-gold': 'linear-gradient(135deg, #D4A843 0%, #CD7F32 100%)',
      }
    },
  },
  plugins: [],
}
