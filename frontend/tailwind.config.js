/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.js",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./node_modules/heroui-native/lib/module/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // HeroUI Native static colors for dark theme (mapped from HeroUI CSS tokens)
        // This ensures Uniwind generates static values for React Native
        foreground: '#ffffff',
        background: '#000000',
        content1: '#18181b', // surface
        content2: '#27272a', // surface-secondary
        content3: '#3f3f46', // surface-tertiary
        content4: '#52525b',
        divider: 'rgba(255, 255, 255, 0.15)',
        overlay: 'rgba(0, 0, 0, 0.9)',
        focus: '#006fee',
        
        default: {
          DEFAULT: '#3f3f46',
          foreground: '#ffffff',
        },
        primary: {
          DEFAULT: '#006fee',
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: '#7828c8',
          foreground: '#ffffff',
        },
        success: {
          DEFAULT: '#17c964',
          foreground: '#000000',
        },
        warning: {
          DEFAULT: '#f5a524',
          foreground: '#000000',
        },
        danger: {
          DEFAULT: '#f31260',
          foreground: '#ffffff',
        },
      }
    },
  },
  plugins: [],
}
