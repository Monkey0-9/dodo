/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#050505',
        panel: 'rgba(20, 20, 20, 0.7)',
        primary: '#00F0FF',
        secondary: '#B026FF',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
