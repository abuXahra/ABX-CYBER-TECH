import type { Config } from "tailwindcss";

// Every colour resolves to a CSS variable written by the database-driven
// theme (see src/lib/cms/theme.ts). Nothing here is a hardcoded brand value.
const token = (name: string) => `rgb(var(--color-${name}-rgb) / <alpha-value>)`;

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    screens: { sm: "640px", md: "768px", lg: "900px", xl: "1200px", "2xl": "1536px" },
    extend: {
      colors: {
        primary: token("primary"),
        secondary: token("secondary"),
        dark: token("dark"),
        accent: token("accent"),
        background: token("background"),
        surface: token("surface"),
        foreground: token("foreground"),
        heading: token("heading"),
        line: token("border"),
        "nav-bg": token("navbar-bg"),
        "nav-text": token("navbar-text"),
        "footer-bg": token("footer-bg"),
        "footer-text": token("footer-text"),
        "btn-bg": token("button-bg"),
        "btn-text": token("button-text"),
        "accent-btn-bg": token("accent-button-bg"),
        "accent-btn-text": token("accent-button-text"),
        hover: token("hover"),
        focus: token("focus-ring"),
        cyan: token("cyan"),
        tint: token("tint"),
      },
      fontFamily: {
        heading: "var(--font-heading)",
        body: "var(--font-body)",
        script: "'Caveat Variable', cursive",
      },
      borderRadius: {
        DEFAULT: "var(--radius)",
        md: "var(--radius)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
      },
      boxShadow: { card: "var(--shadow-card)", "card-hover": "var(--shadow-card-hover)" },
      spacing: { section: "var(--section-y)" },
    },
  },
  plugins: [],
};

export default config;
