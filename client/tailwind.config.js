/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#EFF6FF',
          600: '#2563EB',
        },
        success: {
          600: '#16A34A',
        },
        warning: {
          600: '#D97706',
        },
        danger: {
          600: '#DC2626',
        },
        info: {
          600: '#0891B2',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};