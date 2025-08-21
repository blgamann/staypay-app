/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'defi': {
          'dark': '#0D1320',
          'darker': '#070B11',
          'card': '#1A1F2E',
          'border': '#2A3041',
          'hover': '#242B3D',
          'light-text': '#C3C7CF',
          'medium-text': '#8B92A3',
        },
        'primary': {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
        },
        'success': {
          500: '#10B981',
          600: '#059669',
        },
        'warning': {
          500: '#F59E0B',
          600: '#D97706',
        },
        'error': {
          500: '#EF4444',
          600: '#DC2626',
        }
      },
      fontFamily: {
        'mono': ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}

