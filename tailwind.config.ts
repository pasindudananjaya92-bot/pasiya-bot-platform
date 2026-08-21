import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#070b14",
        panel: "#0d1526",
        border: "rgba(0,229,255,0.15)",
        accent: "#00e5ff",
      },
    },
  },
  plugins: [],
};
export default config;
