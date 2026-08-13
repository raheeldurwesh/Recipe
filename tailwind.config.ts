import type { Config } from 'tailwindcss'
import animate from 'tailwindcss-animate'

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        // Recipet Design Tokens
        brand: {
          tomato: '#E4573D',
          'tomato-dark': '#C9442A',
          'tomato-light': '#F07058',
        },
        cream: '#FFF9F2',
        charcoal: '#24211F',
        'warm-gray': '#6F6862',
        golden: '#D99A3D',
        'border-warm': '#E9E1D8',
        'surface-white': '#FFFFFF',
        // shadcn compatibility
        border: '#E9E1D8',
        input: '#E9E1D8',
        ring: '#E4573D',
        background: '#FFF9F2',
        foreground: '#24211F',
        primary: {
          DEFAULT: '#E4573D',
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#F5EFE8',
          foreground: '#24211F',
        },
        destructive: {
          DEFAULT: '#ef4444',
          foreground: '#FFFFFF',
        },
        muted: {
          DEFAULT: '#F5EFE8',
          foreground: '#6F6862',
        },
        accent: {
          DEFAULT: '#F5EFE8',
          foreground: '#24211F',
        },
        popover: {
          DEFAULT: '#FFFFFF',
          foreground: '#24211F',
        },
        card: {
          DEFAULT: '#FFFFFF',
          foreground: '#24211F',
        },
      },
      fontFamily: {
        serif: ['"DM Serif Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-xl': ['4rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-lg': ['3rem', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
        'display-md': ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        'display-sm': ['1.75rem', { lineHeight: '1.25', letterSpacing: '-0.01em' }],
      },
      borderRadius: {
        lg: '0.5rem',
        md: '0.375rem',
        sm: '0.25rem',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'skeleton-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.4s ease-out forwards',
        'skeleton-pulse': 'skeleton-pulse 1.5s ease-in-out infinite',
      },
    },
  },
  plugins: [animate],
}

export default config
