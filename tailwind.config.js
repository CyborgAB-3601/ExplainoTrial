/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          indigo: '#6366F1',
          purple: '#7C5CFF',
          pink: '#EC4899',
        },
        navy: {
          900: '#1E1B2E',
          800: '#2A253E',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft-glow': '0 10px 30px -5px rgba(124, 92, 255, 0.12), 0 4px 12px -2px rgba(0, 0, 0, 0.04)',
        'card-lift': '0 20px 35px -10px rgba(124, 92, 255, 0.15), 0 8px 16px -4px rgba(0, 0, 0, 0.06)',
        'orb-glow': '0 0 50px rgba(168, 85, 247, 0.4), 0 0 100px rgba(99, 102, 241, 0.25)',
      },
      animation: {
        'float': 'float 4s ease-in-out infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        }
      }
    },
  },
  plugins: [],
}
