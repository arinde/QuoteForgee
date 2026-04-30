/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        forge: {
          50:  '#fdfaf4',
          100: '#f9f0dc',
          200: '#f1dea8',
          300: '#e6c86a',
          400: '#d9ac3a',
          500: '#c49220',
          600: '#a87518',
          700: '#865b16',
          800: '#6e4a19',
          900: '#5c3d1a',
          950: '#341f09',
        },
        ink: {
          50:  '#f5f5f0',
          100: '#e8e8de',
          200: '#d4d4c4',
          300: '#b8b89f',
          400: '#9a9a7c',
          500: '#82826a',
          600: '#666651',
          700: '#525244',
          800: '#44443a',
          900: '#3c3c34',
          950: '#1e1e18',
        },
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease-out forwards',
        'fade-in': 'fadeIn 0.4s ease-out forwards',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
