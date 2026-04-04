export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#2980b9',
          600: '#1e6fa0',
          700: '#1a5c87',
          800: '#1e3a5f',
          900: '#162d4a',
        },
      },
      fontFamily: {
        sans: ['Manrope', 'sans-serif'],
        serif: ['"Playfair Display"', 'serif'],
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '20px',
      },
      boxShadow: {
        'card': '0 1px 4px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.03)',
        'card-lg': '0 4px 16px rgba(41,128,185,0.08), 0 8px 32px rgba(0,0,0,0.06)',
      },
    },
  },
  plugins: [],
}