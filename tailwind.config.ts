import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        delta: {
          950: "#020617",
          900: "#0f172a",
          800: "#1e293b",
          500: "#06b6d4",
          400: "#22d3ee",
        },
        stress: {
          low: "#10b981",
          moderate: "#f59e0b",
          high: "#ef4444",
        },
      },
      keyframes: {
        spin: {
          to: { transform: "rotate(360deg)" },
        },
      },
      animation: {
        spin: "spin 1s linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;
