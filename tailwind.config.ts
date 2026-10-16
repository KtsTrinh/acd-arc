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
          950: "#040810", // Obsidian Mariana depth
          900: "#070d1a", // Deep Midnight Navy (Primary Background)
          850: "#0b1426", // Dark Oceanic Slate (Card Background)
          800: "#0f1b33", // Elevated Container
          700: "#182a4d", // Border & subtle line
          600: "#223b6c", // Hover line
          500: "#2d5295", // Deep Royal Water
          400: "#38bdf8", // Glacial Sky Blue (Kim sinh Thủy accent)
          300: "#7dd3fc", // Light Glacial Cyan
          200: "#bae6fd", // Shimmer Water
          100: "#e0f2fe", // Water highlight
          50: "#f0f9ff",  // Foam white
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

