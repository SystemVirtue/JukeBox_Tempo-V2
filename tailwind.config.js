/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#121212",
        foreground: "#f5f5f5",
        primary: {
          DEFAULT: "#ff3030",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#0f0f0f",
          foreground: "#ffffff",
        },
        border: "#333333",
        input: "#333333",
        ring: "#ff3030",
      },
      borderWidth: {
        '4mm': '4mm',
      },
      aspectRatio: {
        '4/3': '4 / 3',
        '16/9': '16 / 9',
        '1.8/1': '1.8 / 1',
      },
      keyframes: {
        "glow": {
          "0%, 100%": { boxShadow: "0 0 5px #ff3030, 0 0 10px #ff3030" },
          "50%": { boxShadow: "0 0 15px #ff3030, 0 0 20px #ff3030" },
        },
        "pulse": {
          "0%, 100%": { opacity: 1 },
          "50%": { opacity: 0.8 },
        },
      },
      animation: {
        "glow": "glow 2s ease-in-out infinite",
        "pulse": "pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
  ],
}
