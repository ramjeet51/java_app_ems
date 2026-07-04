/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        paper: '#F8F7F4',
        surface: '#FFFFFF',
        ink: '#1C1B19',
        muted: '#8A8578',
        line: '#E6E3DC',
        forest: {
          50: '#EEF3EE',
          100: '#D6E3D9',
          300: '#7FA98A',
          500: '#3C6B4C',
          600: '#2D5C3F',
          700: '#234A33',
          900: '#13291C',
        },
        copper: {
          100: '#F3E0CC',
          300: '#E0AD74',
          500: '#C77D3D',
          600: '#A8632D',
        },
        danger: '#B3432B',
      },
      fontFamily: {
        display: ['var(--font-fraunces)', 'serif'],
        sans: ['var(--font-inter)', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(28,27,25,0.04), 0 4px 16px rgba(28,27,25,0.06)',
      },
      borderRadius: {
        card: '14px',
      },
    },
  },
  plugins: [],
};
