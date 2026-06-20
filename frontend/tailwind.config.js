import tailwindAnimate from "tailwindcss-animate";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: { "2xl": "1200px" }
    },
    extend: {
      colors: {
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: { DEFAULT: "var(--primary)", foreground: "var(--primary-foreground)" },
        secondary: { DEFAULT: "var(--secondary)", foreground: "var(--secondary-foreground)" },
        destructive: { DEFAULT: "var(--destructive)", foreground: "var(--destructive-foreground)" },
        muted: { DEFAULT: "var(--muted)", foreground: "var(--muted-foreground)" },
        accent: { DEFAULT: "var(--accent)", foreground: "var(--accent-foreground)" },
        popover: { DEFAULT: "var(--popover)", foreground: "var(--popover-foreground)" },
        card: { DEFAULT: "var(--card)", foreground: "var(--card-foreground)" },

        // Brand — "Daybreak"
        canvas: "#F3F6F3",
        paper: "#FFFFFF",
        ink: "#0A1C16",
        emerald: {
          DEFAULT: "#0C7A57",
          50: "#EAF6F0",
          100: "#D2EEDF",
          200: "#A3DCBF",
          400: "#2FA277",
          500: "#0C7A57",
          600: "#0A6347",
          700: "#075138",
          900: "#063A29"
        },
        gold: {
          DEFAULT: "#E1962B",
          50: "#FCF4E6",
          100: "#FAE7C6",
          300: "#F3C778",
          500: "#E1962B",
          600: "#C57C19"
        },
        sky: "#3E7DC2",
        lilac: "#7C6BD6",
        clay: "#D9744E",
        mint: "#E1F3E9",
        sand: "#F6EEDD",
        haze: "#455A4F"
      },
      fontFamily: {
        display: ['"Fraunces"', "ui-serif", "Georgia", "serif"],
        sans: ['"Hanken Grotesk"', "ui-sans-serif", "system-ui", "sans-serif"]
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 4px)",
        sm: "calc(var(--radius) - 8px)",
        "4xl": "2rem"
      },
      boxShadow: {
        soft: "0 2px 4px rgba(8, 38, 28, 0.04), 0 20px 50px -24px rgba(8, 38, 28, 0.20)",
        lift: "0 1px 2px rgba(8, 38, 28, 0.06), 0 28px 60px -28px rgba(8, 38, 28, 0.28)",
        glow: "0 0 0 1px rgba(12, 122, 87, 0.10), 0 24px 70px -30px rgba(12, 122, 87, 0.45)",
        inset: "inset 0 1px 0 rgba(255,255,255,0.7)"
      },
      keyframes: {
        "aurora-drift": {
          "0%, 100%": { transform: "translate3d(0,0,0) scale(1)" },
          "33%": { transform: "translate3d(3%, -4%, 0) scale(1.08)" },
          "66%": { transform: "translate3d(-3%, 3%, 0) scale(0.96)" }
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(14px)" },
          to: { opacity: "1", transform: "translateY(0)" }
        },
        "msg-in": {
          from: { opacity: "0", transform: "translateY(8px) scale(0.99)" },
          to: { opacity: "1", transform: "translateY(0) scale(1)" }
        },
        shimmer: { "100%": { transform: "translateX(100%)" } },
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-100%)" }
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" }
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" }
        }
      },
      animation: {
        "aurora-drift": "aurora-drift 22s ease-in-out infinite",
        "fade-up": "fade-up 0.7s cubic-bezier(0.16,1,0.3,1) both",
        "msg-in": "msg-in 0.32s cubic-bezier(0.16,1,0.3,1) both",
        marquee: "marquee 38s linear infinite",
        "accordion-down": "accordion-down 0.24s ease-out",
        "accordion-up": "accordion-up 0.24s ease-out"
      }
    }
  },
  plugins: [tailwindAnimate]
};
