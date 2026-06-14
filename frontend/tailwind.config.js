/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: {
          light: '#fbfbfb',
          dark: '#09090b' // Zinc 950
        },
        card: {
          light: '#ffffff',
          dark: '#18181b' // Zinc 900
        },
        border: {
          light: '#e4e4e7', // Zinc 200
          dark: '#27272a' // Zinc 800
        },
        primary: {
          DEFAULT: '#7c3aed', // Violet 600
          hover: '#6d28d9',
          light: '#c084fc'
        },
        accent: {
          DEFAULT: '#8b5cf6', // Violet 500
          hover: '#7c3aed',
          light: '#ddd6fe'
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
