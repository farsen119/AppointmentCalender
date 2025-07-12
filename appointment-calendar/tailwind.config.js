/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#eaf9e7',
        secondary: '#COE6BA',
        accent: '#4ca771',
        dark: '#013237',
      }
    },
  },
  plugins: [],
}