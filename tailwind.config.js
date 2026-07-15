/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        bg: "#0F1116",
        surface: "#1A1E27",
        border: "#262B36",
        text: "#E6E9EF",
        textDim: "#8A93A3",
        accent: "#2DD4BF",
        bejBg: "#F5EFE6",
        bejSurface: "#EAE2D6",
        bejBorder: "#DDD2C2",
        bejText: "#2C2621",
        bejTextDim: "#8A7F6F",
        bejAccent: "#0E9384",
      },
    },
  },
  plugins: [],
};