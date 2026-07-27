import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: [
    'bg-red-50',
    'text-red-700',
    'bg-green-50',
    'text-green-700',
    'rounded-full',
    'px-3',
    'py-1',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#e84500',
          hover: '#cc3a07',
          press: '#9e2c04',
          soft: '#f97a3d',
          subtle: '#ffd8c4',
        },
        ink: {
          900: '#13233d',
          700: '#34465d',
          500: '#6d7d91',
        },
        surface: {
          soft: '#f6f9fc',
          cream: '#f7eddc',
          dark: '#19233b',
        },
        hairline: {
          DEFAULT: '#e0e7ef',
          input: '#adc0d7',
        },
        accent: {
          rose: '#df4770',
          pink: '#ef7bc2',
          ochre: '#b57738',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      fontWeight: {
        light: '300',
        normal: '400',
      },
      borderRadius: {
        xs: '4px',
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        pill: '9999px',
      },
      boxShadow: {
        1: '0 1px 3px rgba(21,59,101,0.08)',
        2: '0 8px 24px rgba(21,59,101,0.08), 0 2px 6px rgba(21,59,101,0.04)',
      },
    },
  },
  plugins: [],
}

export default config
