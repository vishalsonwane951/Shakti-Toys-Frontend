module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        dark: {
          900: "#12121a",
          800: "#1a1a2e",
          700: "#16213e",
        },
        primary: {
          50: "#fff8eb",
          100: "#ffecc6",
          200: "#ffd888",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59300",
          600: "#d97900",
          700: "#b35f00",
          800: "#8f4a02",
          900: "#753d07",
        },
        border: "rgba(255,255,255,0.08)",
      },
      fontFamily: {
        body: ["Inter", "sans-serif"],
        display: ["Poppins", "sans-serif"],
      },
    },
  },
  plugins: [],
};