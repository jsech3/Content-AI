/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          50: '#f7f7f8',
          100: '#eeeef1',
          200: '#d8d9df',
          300: '#b6b8c2',
          400: '#8f919f',
          500: '#6b6d7c',
          600: '#555764',
          700: '#444552',
          800: '#2e2f38',
          900: '#1d1e24',
          950: '#131318',
        },
        accent: {
          primary: '#3b82f6',
          secondary: '#8b5cf6',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'dark-gradient': 'linear-gradient(to bottom right, #1a1b26, #292b3d)',
      },
      boxShadow: {
        'glow': '0 0 15px rgba(59, 130, 246, 0.5), 0 0 30px rgba(139, 92, 246, 0.3)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
      },
      fontFamily: {
        'space-grotesk': ['Space Grotesk', 'sans-serif'],
      },
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' }
        }
      },
      animation: {
        shimmer: 'shimmer 2s infinite',
        float: 'float 3s ease-in-out infinite'
      }
    },
  },
  plugins: [],
};