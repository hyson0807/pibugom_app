/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        "skin-bg": "#FFF5F0",
        "skin-surface": "#FFFFFF",
        "skin-border": "#F0E0D8",
        "skin-primary": "#E87461",
        "skin-text": "#3D3D3D",
        "skin-text-secondary": "#8A8A8A",
        "skin-inactive": "#C4C4C4",
        "skin-success": "#4CAF50",
        "skin-error": "#E53935",
        "skin-accent": "#FF8A65",
        "skin-tab": "#FFF0E8",
        "skin-cream": "#FFF8DC",
        "skin-dark": "#1A1A2E",
        "skin-dark-surface": "#25253E",
        "skin-dark-border": "#3A3A5C",
      },
    },
  },
  plugins: [],
};
