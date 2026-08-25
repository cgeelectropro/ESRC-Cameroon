import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
      },
      colors: {
        border: 'var(--border)',
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: 'var(--primary)',
        'primary-foreground': 'var(--primary-foreground)',
        muted: 'var(--muted)',
        'muted-foreground': 'var(--muted-foreground)',
        accent: 'var(--accent)',
        'accent-foreground': 'var(--accent-foreground)',
        card: 'var(--card)',
        'card-foreground': 'var(--card-foreground)',
        popover: 'var(--popover)',
        'popover-foreground': 'var(--popover-foreground)',
        secondary: 'var(--secondary)',
        'secondary-foreground': 'var(--secondary-foreground)',
        destructive: 'var(--destructive)',
        'destructive-foreground': 'var(--destructive-foreground)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        esrc: {
          'green-900': '#1B5E20',
          'green-800': '#166534',
          'green-700': '#2E7D32',
          'green-600': '#388E3C',
          'green-500': '#4CAF50',
          'green-100': '#E8F5E9',
          'green-50': '#F1F8E9',
          'gold-700': '#F57F17',
          'gold-600': '#F67C0F',
          'gold-500': '#F9A825',
          'gold-100': '#FFFDE7',
          earth: '#795548',
          dark: '#1A1A1A',
          mid: '#555555',
          light: '#F5F5F5',
        },
      },
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
      keyframes: {
        'count-up': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-in-up': {
          '0%': {
            opacity: '0',
            transform: 'translateY(20px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        'slide-in': {
          '0%': {
            transform: 'translateX(-100%)',
          },
          '100%': {
            transform: 'translateX(0)',
          },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        'count-up': 'count-up 2s ease-out',
        'fade-in-up': 'fade-in-up 0.8s ease-out',
        'slide-in': 'slide-in 0.3s ease-out',
        'marquee': 'marquee 25s linear infinite',
      },
    },
  },
  plugins: [],
}

export default config
