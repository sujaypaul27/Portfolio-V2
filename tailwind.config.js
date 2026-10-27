/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cream: 'rgb(var(--cream-rgb) / <alpha-value>)',
        ink: 'rgb(var(--ink-rgb) / <alpha-value>)',
        black: 'rgb(var(--ink-rgb) / <alpha-value>)',
        panel: 'rgb(var(--panel-rgb) / <alpha-value>)',
        accent: 'rgb(var(--accent-rgb) / <alpha-value>)',
        ghost: 'var(--ghost)',
      },
      fontFamily: {
        sans: ['Karla', 'sans-serif'],
        mono: ['"Ubuntu Mono"', 'monospace'],
        display: ['Michroma', 'Unbounded', 'sans-serif'],
      },
      borderRadius: {
        asymmetric: '0 20% 0 20%',
      },
    },
  },
  plugins: [],
};
