/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0B1B2B',
          900: '#050D16',
          800: '#0B1B2B',
          700: '#17304A',
          600: '#274966',
        },
        paper: {
          DEFAULT: '#F8F5EE',
          dark: '#EFEADF',
        },
        accent: {
          DEFAULT: '#E2835B',
          dark: '#C56843',
          light: '#F1A885',
        },
        ink: '#0B1B2B',
      },
      fontFamily: {
        serif: ['Fraunces', 'ui-serif', 'Georgia', 'serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        tightest: '-0.04em',
      },
      boxShadow: {
        card: '0 1px 0 rgba(11,27,43,0.08), 0 12px 30px -12px rgba(11,27,43,0.15)',
      },
    },
  },
  plugins: [],
};
