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
          'gold-light': '#F0D78C',
          bronze: '#CD7F32',
          dark: '#0D0D1A',
          darker: '#070710',
          purple: '#2D1B69',
          'purple-light': '#4A2D8A',
          'purple-deep': '#150D33',
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
        'gradient-kingdom': 'linear-gradient(160deg, #0D0D1A 0%, #1A0D2E 30%, #150D33 60%, #0D0D1A 100%)',
        'gradient-cosmos': 'linear-gradient(160deg, #070710 0%, #0D1B3E 30%, #1A0D4A 60%, #070710 100%)',
        'gradient-shadows': 'linear-gradient(160deg, #070710 0%, #0D1A15 30%, #111A0D 60%, #070710 100%)',
        'gradient-gold': 'linear-gradient(135deg, #D4A843 0%, #F0D78C 40%, #CD7F32 100%)',
        'gradient-gold-subtle': 'linear-gradient(135deg, rgba(212,168,67,0.1) 0%, rgba(205,127,50,0.05) 100%)',
      },
      animation: {
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
        'float-slow': 'float-slow 6s ease-in-out infinite',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      }
    },
  },
  plugins: [],
}
