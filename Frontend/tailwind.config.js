/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6', // Blue for students
        secondary: '#10b981', // Green for teachers
        dark: '#1e293b',
        light: '#f1f5f9'
      }
    },
  },
  plugins: [],
}
