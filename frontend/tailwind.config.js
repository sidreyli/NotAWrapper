/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        page: "#F7F9FA",
        surface: "#FFFFFF",
        ink: "#111827",
        muted: "#4B5563",
        border: "#D1D5DB",
        deep: "#005F63",
        teal: "#0F766E",
        aqua: "#20C5C6",
        softAqua: "#E8FAFA",
        dark: "#061B1F",
        success: "#15803D",
        warning: "#B45309",
        review: "#6D28D9",
        error: "#B91C1C",
        lineInk: "#374151"
      },
      boxShadow: {
        soft: "0 24px 70px rgba(6, 27, 31, 0.12)",
        card: "0 10px 30px rgba(17, 24, 39, 0.05)"
      },
      fontFamily: {
        display: ['"Arial Narrow"', '"Roboto Condensed"', '"Source Sans 3"', "Arial", "sans-serif"],
        body: ['"Source Sans 3"', "Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};
