/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#16181d',
        paper: '#faf9f7',
        ember: {
          DEFAULT: '#e4572e',
          dark: '#c8451f',
        },
        steel: '#3b6e8f',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
