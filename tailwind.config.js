/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          dark: '#080A0F',
          card: '#0F131D',
          border: '#1F2738',
          accent: '#00F0FF',
          neon: '#7928CA',
          gold: '#FFB800',
          emerald: '#10B981',
          rose: '#F43F5E'
        }
      },
      fontFamily: {
        display: ['Orbitron', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        sans: ['Inter', 'sans-serif']
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s infinite ease-in-out',
        'tilt-phone': 'tiltPhone 3s infinite ease-in-out',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 15px rgba(0, 240, 255, 0.4)' },
          '50%': { boxShadow: '0 0 25px rgba(0, 240, 255, 0.8)' }
        },
        tiltPhone: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '35%, 65%': { transform: 'rotate(-90deg)' }
        }
      }
    },
  },
  plugins: [],
}
