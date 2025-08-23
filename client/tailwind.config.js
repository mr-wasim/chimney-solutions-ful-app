/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html','./src/**/*.{js,jsx}'],
  theme: { extend: {} },
  plugins: [],
  extend: {
  animation: {
    'spin-slow': 'spin 3s linear infinite',
    'spin-fast': 'spin 1s linear infinite',
  },
}
}
