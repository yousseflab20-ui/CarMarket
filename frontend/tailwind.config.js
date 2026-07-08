/** @type {import('tailwindcss').Config} */
// Tailwind v4: config is now in global.css via @theme / @source directives.
// This file is kept for tools that still expect it.
module.exports = {
  darkMode: 'class',
  content: [
    "./index.js",
    "./src/**/*.{js,jsx,ts,tsx}",
    "../node_modules/heroui-native/lib/module/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
