/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#6b00ff",
          dark: "#5200c7",
          light: "#8b3dff",
          soft: "#f1ebff",
          tile: "#f5f0ff",
          50: "#f6f1ff",
          100: "#ede3ff",
          200: "#dccbff",
          300: "#c2a3ff",
          400: "#a26bff",
          500: "#8533ff",
          600: "#6b00ff",
          700: "#5a00d6",
          800: "#4a00ad",
          900: "#3b0a85",
        },
        accent: { DEFAULT: "#e040fb", soft: "#fde7ff" },
        ink: "#0b0b1a",
        sun: "#ffc800",
        ok: "#12b76a",
        night: {
          DEFAULT: "#08080f",
          50: "#1c1c2b",
          100: "#161623",
          200: "#11111b",
          300: "#0c0c15",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", '"Inter Variable"', "Inter", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        "2xs": "0 1px 2px rgba(16, 12, 40, 0.04)",
        xs: "0 1px 3px rgba(16, 12, 40, 0.06)",
        soft: "0 1px 2px rgba(16,12,40,.04), 0 8px 24px -8px rgba(16,12,40,.08)",
        lift: "0 2px 4px rgba(16,12,40,.04), 0 24px 48px -16px rgba(60,20,140,.22)",
        glow: "0 10px 30px -8px rgba(107, 0, 255, 0.55)",
        "glow-lg": "0 20px 60px -12px rgba(107, 0, 255, 0.6)",
        "inner-hl": "inset 0 1px 0 0 rgba(255,255,255,0.12)",
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #7c3aed 0%, #6b00ff 45%, #c026d3 100%)",
        "brand-gradient-soft": "linear-gradient(135deg, rgba(124,58,237,.12) 0%, rgba(192,38,211,.10) 100%)",
        "grid-light":
          "linear-gradient(to right, rgba(107,0,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(107,0,255,0.06) 1px, transparent 1px)",
      },
      borderRadius: { "4xl": "2rem" },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        shimmer: { "100%": { transform: "translateX(100%)" } },
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "gradient-pan": {
          "0%,100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        marquee: { "0%": { transform: "translateX(0)" }, "100%": { transform: "translateX(-50%)" } },
        "ken-burns": { "0%": { transform: "scale(1)" }, "100%": { transform: "scale(1.08)" } },
        progress: { "0%": { width: "0%" }, "100%": { width: "100%" } },
        "pulse-ring": {
          "0%": { transform: "scale(.9)", opacity: ".7" },
          "100%": { transform: "scale(1.6)", opacity: "0" },
        },
      },
      animation: {
        "fade-up": "fade-up .7s cubic-bezier(.2,.7,.2,1) both",
        "fade-in": "fade-in .4s ease-out both",
        "scale-in": "scale-in .25s cubic-bezier(.2,.7,.2,1) both",
        shimmer: "shimmer 1.6s infinite",
        float: "float 6s ease-in-out infinite",
        "gradient-pan": "gradient-pan 8s ease infinite",
        marquee: "marquee 40s linear infinite",
        "ken-burns": "ken-burns 9s ease-out both",
        "pulse-ring": "pulse-ring 1.8s cubic-bezier(.2,.7,.2,1) infinite",
      },
    },
  },
  plugins: [],
};
