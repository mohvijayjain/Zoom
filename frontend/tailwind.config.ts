import type { Config } from "tailwindcss";

// Colors read from the CSS variables in globals.css so there is exactly one
// place to change a token, and the raw values never get duplicated here.
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        zoom: {
          blue: "var(--zoom-blue)",
          "blue-hover": "var(--zoom-blue-hover)",
          dark: "var(--zoom-dark)",
          avatar: "var(--zoom-avatar)",
          text: "var(--zoom-text)",
          "text-muted": "var(--zoom-text-muted)",
          border: "var(--zoom-border)",
          "sidebar-active": "var(--zoom-sidebar-active)",
          "room-bg": "var(--zoom-room-bg)",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      fontSize: {
        // The utility bar and sidebar sit between Tailwind's xs and sm steps.
        utility: ["13px", "18px"],
      },
      spacing: {
        sidebar: "250px",
        utilitybar: "32px",
        navbar: "64px",
      },
    },
  },
  plugins: [],
};

export default config;
