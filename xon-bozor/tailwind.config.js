/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: "#6b00ff", dark: "#5200c7", soft: "#eef0ff", tile: "#f0f1ff" },
        ink: "#12122b",
        sun: "#ffc800",
        ok: "#12b76a",
      },
      fontFamily: { sans: ['"Inter Variable"', "Inter", "system-ui", "sans-serif"] },
    },
  },
  plugins: [],
};
