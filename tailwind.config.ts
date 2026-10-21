import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        thuy: {
          950: "#000000", // Pure black
          900: "#050505", // Deep black (Primary Background)
          850: "#0a0a0a", // Card Background
          800: "#141414", // Elevated Container
          700: "#1f1f1f", // Border & subtle line
          600: "#2a2a2a", // Hover line
          500: "#3a3a3a", // Deep slate
          400: "#d4d4d4", // Silver accent (luxury)
          300: "#e5e5e5", // Light silver
          200: "#f0f0f0", // Shimmer
          100: "#f5f5f5", // Highlight
          50: "#fafafa",  // Foam white
        },
        aqua: {
          400: "#22d3ee",
          500: "#06b6d4",
          600: "#0891b2",
        },
        silver: {
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
        }
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "-apple-system", "sans-serif"],
        display: ["var(--font-outfit)", "system-ui", "-apple-system", "sans-serif"],
      },
      boxShadow: {
        'glow-cyan': '0 0 25px -5px rgba(6, 182, 212, 0.35)',
        'glow-blue': '0 0 35px -5px rgba(56, 189, 248, 0.3)',
        'card-dark': '0 8px 30px rgba(0, 0, 0, 0.65)',
      },
      backgroundImage: {
        'radial-gradient': 'radial-gradient(circle at 50% 20%, rgba(14, 165, 233, 0.12) 0%, rgba(7, 13, 26, 0.98) 70%)',
        'water-glow': 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(56, 189, 248, 0.15), rgba(255, 255, 255, 0))',
      }
    },
  },
  plugins: [],
};
export default config;

