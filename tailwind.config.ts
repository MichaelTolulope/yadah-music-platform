import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // ── Sacred Synth Color Tokens ──
      colors: {
        // Surface Scale
        "surface":                   "#131313",
        "surface-dim":               "#131313",
        "surface-bright":            "#393939",
        "surface-container-lowest":  "#0e0e0e",
        "surface-container-low":     "#1c1b1b",
        "surface-container":         "#201f1f",
        "surface-container-high":    "#2a2a2a",
        "surface-container-highest": "#353534",
        "surface-variant":           "#353534",
        "surface-tint":              "#cdbdff",
        // On-Surface
        "on-surface":                "#e5e2e1",
        "on-surface-variant":        "#cac3d8",
        "inverse-surface":           "#e5e2e1",
        "inverse-on-surface":        "#313030",
        // Primary — Deep Purple
        "primary":                   "#cdbdff",
        "on-primary":                "#370096",
        "primary-container":         "#7c4dff",
        "on-primary-container":      "#fcf6ff",
        "primary-fixed":             "#e8deff",
        "primary-fixed-dim":         "#cdbdff",
        "on-primary-fixed":          "#20005f",
        "on-primary-fixed-variant":  "#4f00d0",
        "inverse-primary":           "#6833ea",
        // Secondary — Celestial Gold
        "secondary":                 "#fff9ef",
        "on-secondary":              "#3a3000",
        "secondary-container":       "#ffdb3c",
        "on-secondary-container":    "#725f00",
        "secondary-fixed":           "#ffe16d",
        "secondary-fixed-dim":       "#e9c400",
        "on-secondary-fixed":        "#221b00",
        "on-secondary-fixed-variant":"#544600",
        // Tertiary — Electric Cyan
        "tertiary":                  "#00daf3",
        "on-tertiary":               "#00363d",
        "tertiary-container":        "#007e8d",
        "on-tertiary-container":     "#ebfcff",
        "tertiary-fixed":            "#9cf0ff",
        "tertiary-fixed-dim":        "#00daf3",
        "on-tertiary-fixed":         "#001f24",
        "on-tertiary-fixed-variant": "#004f58",
        // Outline
        "outline":                   "#948ea1",
        "outline-variant":           "#494455",
        // Error
        "error":                     "#ffb4ab",
        "on-error":                  "#690005",
        "error-container":           "#93000a",
        "on-error-container":        "#ffdad6",
        // Background
        "background":                "#131313",
        "on-background":             "#e5e2e1",
      },

      // ── Typography ──
      fontFamily: {
        "display":   ["Playfair Display", "Georgia", "serif"],
        "headline":  ["Playfair Display", "Georgia", "serif"],
        "body":      ["Hanken Grotesk", "system-ui", "sans-serif"],
        "button":    ["Hanken Grotesk", "system-ui", "sans-serif"],
        "mono":      ["JetBrains Mono", "ui-monospace", "monospace"],
      },

      fontSize: {
        "display-lg":          ["48px", { lineHeight: "56px", fontWeight: "700" }],
        "headline-lg":         ["32px", { lineHeight: "40px", fontWeight: "600" }],
        "headline-lg-mobile":  ["28px", { lineHeight: "36px", fontWeight: "600" }],
        "body-lg":             ["18px", { lineHeight: "28px", fontWeight: "400" }],
        "body-md":             ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "label-caps":          ["12px", { lineHeight: "16px", fontWeight: "500", letterSpacing: "0.05em" }],
        "btn":                 ["14px", { lineHeight: "20px", fontWeight: "600" }],
      },

      // ── Border Radius ──
      borderRadius: {
        sm:      "0.25rem",
        DEFAULT: "0.5rem",
        md:      "0.75rem",
        lg:      "1rem",
        xl:      "1.5rem",
        full:    "9999px",
      },

      // ── Spacing ──
      spacing: {
        "base":           "8px",
        "gutter":         "24px",
        "margin-mobile":  "16px",
        "margin-desktop": "40px",
        "container-max":  "1280px",
      },

      // ── Max Width ──
      maxWidth: {
        "container": "1280px",
      },

      // ── Box Shadow — Ambient Glows ──
      boxShadow: {
        "glow-primary": "0 0 40px -10px rgba(124, 77, 255, 0.35)",
        "glow-gold":    "0 0 40px -10px rgba(233, 196, 0, 0.25)",
        "glow-cyan":    "0 0 30px -10px rgba(0, 218, 243, 0.20)",
        "glow-sm":      "0 0 20px -8px rgba(124, 77, 255, 0.25)",
      },

      // ── Backdrop Blur ──
      backdropBlur: {
        "glass": "20px",
      },

      // ── Animations ──
      keyframes: {
        "pulse-accent": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%":       { opacity: "0.6", transform: "scale(1.4)" },
        },
        "fade-in-up": {
          "0%":   { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "shimmer": {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "pulse-accent": "pulse-accent 2s ease-in-out infinite",
        "fade-in-up":   "fade-in-up 0.5s ease forwards",
        "fade-in":      "fade-in 0.4s ease forwards",
        "shimmer":      "shimmer 2s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
