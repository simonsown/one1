/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          primary: '#1e3a8a',
          light: '#3b82f6',
          dark: '#1e40af',
        },
        accent: {
          orange: '#f97316',
          mint: '#10b981',
        },
        bg: {
          base: '#f0f4f8',
          surface: '#ffffff',
        }
      },
      borderRadius: {
        'xl': '14px',
        '2xl': '20px',
      }
    },
  },
  plugins: [],
}

