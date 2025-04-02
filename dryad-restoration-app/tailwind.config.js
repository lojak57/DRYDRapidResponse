/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  safelist: [
    'bg-white',
    'bg-gray-50',
    'bg-gray-100',
    'text-gray-600',
    'text-gray-500',
    'text-gray-700',
    'text-gray-800',
    'hover:bg-gray-50',
    'hover:bg-gray-100'
  ],
  theme: {
    extend: {
      colors: {
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
} 