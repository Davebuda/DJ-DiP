/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        dark: {
          50: '#0a0a0a',
          100: '#1a1a1a',
          200: '#272727',
        },
      },
      boxShadow: {
        'red-sm': '0 0 10px rgba(255, 0, 0, 0.15)',
        'red-md': '0 0 20px rgba(255, 0, 0, 0.2)',
        'red-lg': '0 0 30px rgba(255, 0, 0, 0.3)',
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'var(--font-family, sans-serif)'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
