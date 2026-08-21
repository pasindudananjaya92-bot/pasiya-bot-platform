import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: { DEFAULT: "#070b14", panel: "#0c1220", elev: "#111827" },
        line: "rgba(0,229,255,0.18)",
        accent: { DEFAULT: "#00e5ff", dim: "#0891b2" },
        muted: "#94a3b8"
      },
      boxShadow: {
        glow: "0 0 24px rgba(0,229,255,0.15)"
      }
    }
  },
  plugins: []
};
export default config;
