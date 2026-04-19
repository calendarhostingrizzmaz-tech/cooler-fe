/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        'hero-bounce': {
          '0%, 100%': { transform: 'translateY(0) scale(1)' },
          '50%': { transform: 'translateY(-18px) scale(1.015)' },
        },
        'hero-bounce-soft': {
          '0%, 100%': { transform: 'translateY(0) scale(1)' },
          '40%': { transform: 'translateY(-20px) scale(1.02)' },
          '65%': { transform: 'translateY(-8px) scale(1.008)' },
        },
      },
      animation: {
        'hero-bounce': 'hero-bounce 3s ease-in-out infinite',
        'hero-bounce-soft':
          'hero-bounce-soft 2.8s cubic-bezier(0.34, 1.45, 0.64, 1) infinite',
      },
    },
  },
  plugins: [],
}
