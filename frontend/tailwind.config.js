/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        radium: {
          primary: '#39FF14',
          glow: 'rgba(57, 255, 20, 0.4)',
          faint: 'rgba(57, 255, 20, 0.05)',
        },
        dark: {
          base: '#030504',
          surface: '#0a0f0d',
          panel: '#111a16',
        }
      },
      fontFamily: {
        heading: ['Orbitron', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
