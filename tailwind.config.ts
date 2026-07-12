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
        brand: {
          bg: '#FAF7F2',
          text: '#1A1A1A',
          accent: '#E8450A',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['var(--font-playfair)', 'ui-serif', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}

export default config
