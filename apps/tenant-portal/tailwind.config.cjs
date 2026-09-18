const path = require("path");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    path.join(__dirname, "index.html").replace(/\\/g, "/"),
    path.join(__dirname, "src/**/*.{js,ts,jsx,tsx}").replace(/\\/g, "/"),
  ],
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "hsl(221, 83%, 53%)",
          hover: "hsl(221, 83%, 45%)",
          light: "hsl(221, 83%, 95%)",
          dark: "#1e3a8a",
        },
        success: {
          DEFAULT: "hsl(142, 71%, 45%)",
          light: "hsl(142, 71%, 95%)",
        },
        warning: {
          DEFAULT: "hsl(35, 92%, 50%)",
          light: "hsl(35, 92%, 95%)",
        },
        danger: {
          DEFAULT: "hsl(346, 84%, 61%)",
          light: "hsl(346, 84%, 95%)",
        },
        financial: {
          revenue: "#2563EB",
          "revenue-light": "#EFF6FF",
          net: "#0891B2",
          "net-light": "#ECFEFF",
          expense: "#DC2626",
          "expense-light": "#FEF2F2",
          profit: "#7C3AED",
          "profit-light": "#F5F3FF",
          pending: "#EA580C",
          "pending-light": "#FFF7ED",
        },
      },
      keyframes: {
        "revenue-slide-up": {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
        "revenue-slide-down": {
          "0%": { transform: "translateY(0)" },
          "100%": { transform: "translateY(100%)" },
        },
        "revenue-fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "revenue-fade-out": {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
      },
      animation: {
        "revenue-slide-up": "revenue-slide-up 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "revenue-slide-down": "revenue-slide-down 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "revenue-fade-in": "revenue-fade-in 0.25s ease-out forwards",
        "revenue-fade-out": "revenue-fade-out 0.2s ease-in forwards",
      },
    },
  },
  plugins: [],
};
