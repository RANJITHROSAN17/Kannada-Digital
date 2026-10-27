/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Warm ivory canvas + deep indigo ink + saffron accents.
        ivory: {
          50: '#FFFCF5',
          100: '#FDF7EA',
          200: '#F7EED8',
          300: '#EFE1BE',
        },
        ink: {
          50: '#EEF2FB',
          100: '#D9E0F2',
          400: '#41527E',
          500: '#2E3D63',
          600: '#22304F',
          700: '#1A2440',
          800: '#131B31',
          900: '#0C1224',
        },
        saffron: {
          50: '#FFF6E9',
          100: '#FFE9C7',
          200: '#FFD48C',
          400: '#F5A524',
          500: '#E8890B',
          600: '#C46C06',
          700: '#9A5305',
        },
        // Kannada-friendly highlight for matched search terms.
        leaf: {
          100: '#E3F1E4',
          500: '#2F7A45',
          600: '#245F36',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        // Kannada must render even when the webfont fails to load, so the
        // Noto stack is always followed by OS-level Kannada fallbacks.
        kannada: [
          'Noto Sans Kannada',
          'Tunga',
          'Nirmala UI',
          'Kannada MN',
          'Kannada Sangam MN',
          'Lohit Kannada',
          'sans-serif',
        ],
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
      boxShadow: {
        card: '0 1px 2px rgba(12,18,36,0.04), 0 8px 24px -12px rgba(12,18,36,0.14)',
        lift: '0 2px 4px rgba(12,18,36,0.05), 0 18px 40px -18px rgba(12,18,36,0.28)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pop-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'pulse-ring': {
          '0%': { boxShadow: '0 0 0 0 rgba(232,137,11,0.35)' },
          '70%': { boxShadow: '0 0 0 14px rgba(232,137,11,0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(232,137,11,0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 260ms ease-out both',
        'pop-in': 'pop-in 180ms ease-out both',
        'pulse-ring': 'pulse-ring 1.6s ease-out infinite',
      },
    },
  },
  plugins: [],
};
