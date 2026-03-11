/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      animation: {
        'timer-pulse': 'timer-pulse 1s cubic-bezier(0.42, 0, 0.58, 1) infinite',
        'status-fade': 'status-fade 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
        'button-press': 'button-press 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'digit-flip': 'digit-flip 0.3s cubic-bezier(0.42, 0, 0.58, 1)',
        'progress-glow': 'progress-glow 0.5s cubic-bezier(0.42, 0, 0.58, 1) infinite',
        'warning-flash': 'warning-flash 0.3s cubic-bezier(0.42, 0, 0.58, 1) infinite',
        'celebrate': 'celebrate 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) 2',
      },
    },
  },
  plugins: [],
};