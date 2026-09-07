/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Deep charcoal foundation
        base: {
          950: '#0a0b0f',
          900: '#0f1117',
          850: '#13151c',
          800: '#171a22',
          750: '#1c1f29',
          700: '#232733',
          600: '#2d3240',
          500: '#3a4050',
          400: '#4b5263',
          300: '#6b7280',
          200: '#9aa3b2',
          100: '#c5cbd6',
          50: '#e4e7ec',
        },
        // Primary electric accent
        accent: {
          950: '#0a1f1a',
          900: '#0f2b22',
          800: '#163a2d',
          700: '#1d4f3b',
          600: '#26684e',
          550: '#2e7d5a',
          DEFAULT: '#34d399',
          400: '#4ade80',
          300: '#6ee7a0',
          200: '#a7f3c4',
          100: '#d1fae5',
          50: '#ecfdf5',
          glow: 'rgba(52, 211, 153, 0.35)',
        },
        // Status colors
        success: {
          500: '#22c55e',
          400: '#4ade80',
          50: '#052e16',
          100: '#14532d',
        },
        warning: {
          500: '#f59e0b',
          400: '#fbbf24',
          50: '#422006',
          100: '#713f12',
        },
        danger: {
          500: '#ef4444',
          400: '#f87171',
          50: '#450a0a',
          100: '#7f1d1d',
        },
        info: {
          500: '#3b82f6',
          400: '#60a5fa',
          50: '#172554',
          100: '#1e3a8a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
      },
      boxShadow: {
        subtle: '0 1px 2px 0 rgba(0,0,0,0.4)',
        elevated: '0 4px 12px -2px rgba(0,0,0,0.5), 0 2px 4px -1px rgba(0,0,0,0.3)',
        glow: '0 0 20px 0 rgba(52, 211, 153, 0.25)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.25s ease-out',
        'pulse-subtle': 'pulseSubtle 2s ease-in-out infinite',
        'draw-line': 'drawLine 1.2s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        drawLine: {
          '0%': { strokeDashoffset: '200' },
          '100%': { strokeDashoffset: '0' },
        },
      },
    },
  },
  plugins: [],
};
