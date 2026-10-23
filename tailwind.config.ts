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
        navy: {
          950: "#0B1726",
          900: "#10263F",
          800: "#193B59",
        },
        blue: {
          600: "#167DAD",
        },
        cyan: {
          400: "#53D9F5",
        },
        silver: {
          400: "#B8C4D0",
        },
        slate: {
          600: "#526477",
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
      },
      transitionDuration: {
        fast: "160ms",
      },
    },
  },
  plugins: [],
};
export default config;
