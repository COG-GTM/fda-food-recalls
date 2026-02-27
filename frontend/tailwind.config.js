/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'navy': '#0F172A',
        'card': '#1E293B',
        'card-alt': '#243449',
        'accent-cyan': '#22D3EE',
        'accent-blue': '#60A5FA',
        'accent-indigo': '#818CF8',
        'accent-purple': '#A78BFA',
        'accent-red': '#F87171',
        'accent-green': '#4ADE80',
      }
    },
  },
  plugins: [],
}
