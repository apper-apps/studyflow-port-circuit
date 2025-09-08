/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'display': ['"Plus Jakarta Sans"', 'sans-serif'],
        'body': ['Inter', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#f3f1ff',
          100: '#e9e5ff',
          200: '#d4d0ff',
          300: '#b7abff',
          400: '#9479ff',
          500: '#7c3aed',
          600: '#5b21b6',
          700: '#4c1d95',
          800: '#3c1677',
          900: '#341b61',
        },
        amber: {
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
      },
    },
  },
  plugins: [],
}