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
          950: "#020c1b",
          900: "#0a192f",
          800: "#112240",
          700: "#1e3a5f",
          600: "#2a4b7a",
          500: "#3b82f6",
          400: "#60a5fa",
          300: "#93c5fd",
          200: "#bfdbfe",
          100: "#dbeafe",
        },
        aqua: {
          600: "#22d3ee",
          500: "#06b6d4",
          400: "#22d3ee",
          300: "#67e8f9",
        },
        navy: {
          950: "#0B1726",
          900: "#10263F",
          800: "#193B59",
        },
        blue: {
          600: "#167DAD",
        },
        cyan: {
          500: "#22d3ee",
          400: "#53D9F5",
          300: "#67e8f9",
        },
        silver: {
          400: "#B8C4D0",
        },
        slate: {
          600: "#526477",
        },
        accent: {
          DEFAULT: "#64ffda",
          cyan: "#30a2ff",
        },
        surface: "#FFFFFF",
        canvas: "#F5F7FA",
        border: "#E0E6ED",
        success: "#18794E",
        danger: "#B42318",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "-apple-system", "sans-serif"],
        display: ["var(--font-manrope)", "system-ui", "-apple-system", "sans-serif"],
      },
      boxShadow: {
        card: "0 4px 20px rgba(16, 38, 63, 0.06)",
        "card-hover": "0 8px 30px rgba(16, 38, 63, 0.12)",
        "glow-cyan": "0 0 0 1px rgba(100, 255, 218, 0.4), 0 10px 60px -10px rgba(100, 255, 218, 0.25)",
        "glow-blue": "0 0 0 1px rgba(48, 162, 255, 0.4), 0 10px 60px -10px rgba(48, 162, 255, 0.25)",
      },
      transitionDuration: {
        fast: "160ms",
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.25, 0.8, 0.25, 1)",
        "ease-out-quart": "cubic-bezier(0.25, 1, 0.5, 1)",
      },
    },
  },
  plugins: [],
};
export default config;
