import type { Config } from "tailwindcss";
const config: Config = {content:["./app/**/*.{ts,tsx}","./components/**/*.{ts,tsx}"],
theme:{extend:{colors:{metallic:"#161414ff",charcoal:"#222222",wood:"#3C2A21",gold:"#D4AF37"},boxShadow:{soft:"0 10px 30px rgba(0,0,0,0.08)"}}},plugins:[]};export default config;
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: "#D4AF37",
          light: "#FFD700",
          dark: "#B8860B",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      container: {
        center: true,
        padding: "1rem",
      },
    },
  },
  darkMode: "class", // Optional: enable dark mode toggling
  plugins: [],
};
