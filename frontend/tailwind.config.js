/** @type {import('tailwindcss').Config} */
// Cores e fontes tiradas do conceito visual do PDF (Cardapio_Acai_Design_e_Fluxograma).
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#f8f3ec',
        card: '#ffffff',
        line: '#ece4da',
        acai: { DEFAULT: '#4b1840', dark: '#33102c', light: '#6b2a5e', soft: '#f1e6ee' },
        lime: { DEFAULT: '#b7dc4b', dark: '#86a92a' },
        ink: '#24121f',
        muted: '#7b6f75',
        danger: '#d83a3a',
      },
      fontFamily: {
        display: ["'Nunito'", 'sans-serif'],
        body: ["'Inter'", 'sans-serif'],
      },
      borderRadius: {
        xl2: '1.25rem',
      },
    },
  },
  plugins: [],
}
