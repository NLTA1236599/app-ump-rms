/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        jira: {
          bg: '#f7f8f9',
          nav: '#0747a6',
          column: '#f1f2f4',
          card: '#ffffff',
          border: '#dfe1e6',
        },
        ump: {
          navy: '#1A2E5A',
          brand: '#2B5EDB',
          'brand-hover': '#1E4EC4',
          'brand-active': '#1840A8',
          mid: '#2B7FD4',
          icon: '#3A9FD8',
          hub: '#1A5FA8',
          wave: '#3B9BD1',
          'wave-deep': '#2175AE',
          'branding-aqua': '#6FD4FC',
          'border-input': '#D5E3F0',
          'border-card': '#4A90D9',
          'text-label': '#5A6A80',
          'text-muted': '#7A8BA8',
          placeholder: '#A8BCCF',
          chevron: '#5A7FA8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Helvetica Neue', 'Segoe UI', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        'ump-card': '0 8px 40px rgba(30, 90, 180, 0.14)',
        'ump-btn': '0 4px 16px rgba(43, 94, 219, 0.35)',
        'ump-focus': '0 0 0 3px rgba(58, 159, 216, 0.18)',
      },
    },
  },
  plugins: [],
};
