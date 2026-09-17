/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Deep navy — the platform's base tone. Reads as infrastructure /
        // freight, not tech-startup.
        navy: {
          950: "#0E1B2A",
          900: "#132539",
          800: "#16273B",
          700: "#203752",
          600: "#334D6E",
          400: "#5B7492",
          200: "#AEC0D2",
        },
        // Cool paper background — deliberately not the warm cream default.
        paper: {
          DEFAULT: "#F4F6F5",
          dim: "#E7EBEA",
        },
        // Route accent — amber, evokes reflective route markings on
        // freight vehicles. Used sparingly for the single bold element.
        route: {
          DEFAULT: "#E8A33D",
          dark: "#C7822A",
          light: "#F7D9A0",
        },
        // Transit green — used for in-progress/success states only.
        transit: {
          DEFAULT: "#2F9E68",
          dark: "#227A50",
        },
        ink: {
          DEFAULT: "#101820",
          muted: "#54636F",
          faint: "#8B98A2",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      maxWidth: {
        prose: "68ch",
      },
    },
  },
  plugins: [],
};
