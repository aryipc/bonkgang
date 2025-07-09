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
        'pokemon-yellow': '#ffcb05',
        'pokemon-blue': '#2a75bb',
        'card-b-gold': '#c7a008',
      }
    },
  },
  plugins: [],
}
