/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#FAFAF8',
        primary: {
          DEFAULT: '#4F46E5',
          light: '#6366F1',
          dark: '#4338CA',
        },
        secondary: {
          DEFAULT: '#7C3AED',
          light: '#8B5CF6',
          dark: '#6D28D9',
        },
        success: '#059669',
        warning: '#D97706',
        error: '#DC2626',
        text: {
          DEFAULT: '#1E1E2E',
          secondary: '#64748B',
        },
        border: '#E2E8F0',
      },
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
}
