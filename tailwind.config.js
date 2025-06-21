module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#6C63FF",
        accent: "#FF6584",
        background: "#18181B",
        surface: "#232336",
        card: "#232336",
        muted: "#A1A1AA",
        border: "#27272A",
        glass: "rgba(255,255,255,0.08)",
      },
      fontFamily: {
        display: ["Poppins", "ui-sans-serif", "system-ui"],
        body: ["Inter", "ui-sans-serif", "system-ui"],
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
      },
      borderRadius: {
        xl: "1.25rem",
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
