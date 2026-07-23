/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'brand-yellow': '#d4d2c6',
        'brand-dark': '#231f1f',
        'brand-gray': '#a8a59f',
        'brand-orange': '#9e7c45',
        'brand-brown': '#755a2d',
      },
    },
  },
  plugins: [],
}
