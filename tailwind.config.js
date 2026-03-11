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
        work: {
          primary: '#3b82f6', // blue-500
          secondary: '#10b981', // green-500
          light: '#dbeafe', // blue-100
        },
        break: {
          primary: '#f59e0b', // amber-500
          secondary: '#ef4444', // red-500
          light: '#fef3c7', // amber-100
        }
      }
    },
  },
  plugins: [],
}