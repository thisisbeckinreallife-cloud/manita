import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0a0a0b",
          900: "#111114",
          800: "#17181c",
          700: "#1f2026",
          600: "#2a2c34",
          500: "#3a3d47",
          400: "#5b5f6c",
          300: "#8b909d",
          200: "#c4c7d0",
          100: "#e6e8ee",
        },
        accent: {
          DEFAULT: "#7c5cff",
          muted: "#3b2f7a",
        },
        ok: "#3ecf8e",
        warn: "#f5a524",
        bad: "#ef4444",
      },
      fontFamily: {
        sans: [
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
        ],
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
