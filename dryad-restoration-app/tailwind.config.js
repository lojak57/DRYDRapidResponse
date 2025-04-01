/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        accent: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        dryd: {
          blue: {
            light: '#61C3E2', // Light blue from logo
            DEFAULT: '#2980B9', // Medium blue (updated for better contrast)
            dark: '#264F8E'    // Dark blue from gradient
          },
          burgundy: {
            light: '#9A3667', // Light burgundy
            DEFAULT: '#8A2755', // Medium burgundy from logo
            dark: '#751D44'    // Dark burgundy
          }
        }
      },
      fontFamily: {
        'montserrat': ['Montserrat', 'sans-serif'],
        'roboto-slab': ['"Roboto Slab"', 'serif'],
        'switzer': ['Switzer', 'sans-serif'],
        'mulish': ['Mulish', 'sans-serif']
      },
      backgroundImage: {
        'dryd-gradient': 'linear-gradient(135deg, #61C3E2, #264F8E)',
        'dryd-burgundy-gradient': 'linear-gradient(135deg, #9A3667, #751D44)',
      }
    },
  },
  plugins: [],
  safelist: [
    'mb-8',
    'mt-2',
    'mt-4',
    'p-4',
    'p-5',
    'p-6',
    'py-1',
    'py-2',
    'px-3',
    'px-4',
    'rounded-lg',
    'rounded-xl',
    'overflow-hidden',
    'shadow-md',
    'bg-white',
    'bg-primary-50',
    'bg-primary-100',
    'bg-accent-50',
    'bg-accent-100',
    'text-primary-600',
    'text-primary-700',
    'text-primary-800',
    'text-accent-600',
    'text-accent-700',
    'text-accent-800',
    'border',
    'border-gray-100',
    'border-gray-200',
    'hover:bg-gray-50',
    'hover:shadow-lg'
  ]
} 