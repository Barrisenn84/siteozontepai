import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        ozone: {
          950: '#030810',
          900: '#061324',
          850: '#091D36',
          800: '#0E2849',
        },
        bio: {
          glow: '#00E5BE',
          dim: '#00B899',
          dark: '#006E5B',
        },
        gold: {
          royal: '#C5A059',
          light: '#E6C98A',
          dark: '#876930',
        },
      },
      boxShadow: {
        'liquid-glass': '0 24px 60px -12px rgba(0, 0, 0, 0.75), inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.42)',
        'liquid-glow': '0 0 35px -5px rgba(0, 229, 190, 0.25)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
        serif: ['"Playfair Display"', 'serif'],
      },
    },
  },
  plugins: [],
};

export default config;