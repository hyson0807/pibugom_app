/** @type {import('tailwindcss').Config} */
const { Colors } = require("./constants/colors");

module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        "skin-bg": Colors.skinBg,
        "skin-surface": Colors.skinSurface,
        "skin-border": Colors.skinBorder,
        "skin-primary": Colors.skinPrimary,
        "skin-text": Colors.skinText,
        "skin-text-secondary": Colors.skinTextSecondary,
        "skin-inactive": Colors.skinInactive,
        "skin-success": Colors.skinSuccess,
        "skin-error": Colors.skinError,
        "skin-accent": Colors.skinAccent,
        "skin-tab": Colors.skinTab,
        "skin-placeholder": Colors.skinPlaceholder,
      },
    },
  },
  plugins: [],
};
