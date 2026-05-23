import tailwindScrollbar from 'tailwind-scrollbar';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        /** Dashboard / app shell — see assets/docs/dashboard-overview-analysis.md */
        header: {
          identity: '#005b8e',
          nav: '#0072bc',
          'tab-active-text': '#005b8e',
        },
        chrome: {
          primary: '#1a6ec2',
          'primary-light': '#eff6ff',
          'primary-muted': '#dbeafe',
          divider: '#e5e7eb',
          surface: '#ffffff',
          hover: '#f9fafb',
          'text-heading': '#111827',
          'text-body': '#374151',
          'text-muted': '#6b7280',
          'text-faint': '#9ca3af',
          'badge-border': '#bfdbfe',
        },
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
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.35s ease-out forwards',
        slideUp: 'slideUp 0.35s ease-out forwards',
      },
    },
  },
  plugins: [tailwindScrollbar({ nocompatible: true })],
};
