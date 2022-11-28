/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#022b3a",
        secondary: "#1f7a8c",
        light: "#bfdbf7"
      }
    },
  },
  plugins: [],
}