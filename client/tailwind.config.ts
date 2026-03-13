import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.6s ease-out both",
        "fade-in": "fade-in 0.5s ease-out both",
      },
      colors: {
        gmsa: {
          green: {
            DEFAULT: "#16a34a",
            light: "#22c55e",
            dark: "#15803d",
          },
          white: "#ffffff",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        arabic: ["Amiri", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
