/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        outfit: ["var(--font-outfit)", "sans-serif"],
      },
      typography: {
        DEFAULT: {
          css: {
            fontFamily: "var(--font-outfit)",
            h1: {
              fontFamily: "var(--font-outfit)",
              fontWeight: "700",
            },
            h2: {
              fontFamily: "var(--font-outfit)",
              fontWeight: "600",
            },
            h3: {
              fontFamily: "var(--font-outfit)",
              fontWeight: "600",
            },
            h4: {
              fontFamily: "var(--font-outfit)",
              fontWeight: "600",
            },
            p: {
              fontFamily: "var(--font-outfit)",
            },
            li: {
              fontFamily: "var(--font-outfit)",
            },
            blockquote: {
              fontFamily: "var(--font-outfit)",
            },
          },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
