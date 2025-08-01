/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
      colors: {
        background: {
          DEFAULT: "#ffffff",
          dark: "#0f172a",
        },
        secondary: {
          DEFAULT: "#e5e5e5",
          dark: "#1e293b",
        },
        foreground: {
          DEFAULT: "#0f172a",
          dark: "#f8fafc",
        },
      },
    },
  },
  darkMode: "class",
  plugins: [],
}

module.exports = config;