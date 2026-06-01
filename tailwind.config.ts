import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        cormorant: ["var(--font-cormorant-garamond)", "Georgia", "serif"],
        newsreader: ["var(--font-newsreader)", "Georgia", "serif"],
        instrument: ["var(--font-instrument-sans)", "system-ui", "sans-serif"],
        // Semantic aliases
        serif: ["var(--font-cormorant-garamond)", "Georgia", "serif"],
        body: ["var(--font-newsreader)", "Georgia", "serif"],
        sans: ["var(--font-instrument-sans)", "system-ui", "sans-serif"],
      },

      colors: {
        // Brand palette
        gold: {
          DEFAULT: "#C9A84C",
          light: "#DEC07A",
          dark: "#A07830",
          50: "#FBF6E9",
          100: "#F5EAC9",
          200: "#EBD494",
          300: "#DEC07A",
          400: "#D4AC5E",
          500: "#C9A84C",
          600: "#A07830",
          700: "#7A5820",
          800: "#543C14",
          900: "#2E200A",
        },
        ink: {
          DEFAULT: "#1a1a1a",
          light: "#333333",
          lighter: "#555555",
          50: "#F5F5F5",
          100: "#E8E8E8",
          200: "#CCCCCC",
          300: "#AAAAAA",
          400: "#888888",
          500: "#555555",
          600: "#333333",
          700: "#1a1a1a",
          800: "#111111",
          900: "#080808",
        },
        cream: {
          DEFAULT: "#FAFAF7",
          dark: "#F0F0EB",
        },
        parchment: {
          DEFAULT: "#F5F0E8",
          dark: "#EDE6D6",
          darker: "#E0D5C0",
        },

        // Signal colors
        "signal-buy": {
          DEFAULT: "#1a6b3c",
          light: "#2a9b58",
          dark: "#0f4025",
          bg: "#F0FAF4",
          "bg-dark": "#0a2016",
        },
        "signal-sell": {
          DEFAULT: "#8b1a1a",
          light: "#c22a2a",
          dark: "#5a0f0f",
          bg: "#FDF0F0",
          "bg-dark": "#2a0808",
        },
        "signal-watch": {
          DEFAULT: "#8b5a1a",
          light: "#c27e28",
          dark: "#5a3a0f",
          bg: "#FDF8F0",
          "bg-dark": "#2a1a08",
        },
        "signal-hold": {
          DEFAULT: "#1a3a6b",
          light: "#2a5aab",
          dark: "#0f2045",
          bg: "#F0F4FA",
          "bg-dark": "#08102a",
        },
      },

      fontSize: {
        // Newspaper typography scale
        "headline-xl": [
          "3.5rem",
          { lineHeight: "1.05", letterSpacing: "-0.02em", fontWeight: "700" },
        ],
        "headline-lg": [
          "2.5rem",
          { lineHeight: "1.1", letterSpacing: "-0.015em", fontWeight: "700" },
        ],
        "headline-md": [
          "1.875rem",
          { lineHeight: "1.15", letterSpacing: "-0.01em", fontWeight: "600" },
        ],
        "headline-sm": [
          "1.375rem",
          { lineHeight: "1.2", letterSpacing: "-0.005em", fontWeight: "600" },
        ],
        kicker: [
          "0.6875rem",
          { lineHeight: "1.4", letterSpacing: "0.08em", fontWeight: "600" },
        ],
        dek: [
          "1.125rem",
          { lineHeight: "1.5", letterSpacing: "0em", fontWeight: "400" },
        ],
        byline: [
          "0.75rem",
          { lineHeight: "1.5", letterSpacing: "0.04em", fontWeight: "500" },
        ],
        "body-lg": ["1.125rem", { lineHeight: "1.75", letterSpacing: "0em" }],
        "body-md": ["1rem", { lineHeight: "1.7", letterSpacing: "0em" }],
        "body-sm": ["0.875rem", { lineHeight: "1.6", letterSpacing: "0em" }],
        caption: [
          "0.75rem",
          { lineHeight: "1.5", letterSpacing: "0.01em", fontWeight: "400" },
        ],
        label: [
          "0.6875rem",
          { lineHeight: "1.4", letterSpacing: "0.06em", fontWeight: "600" },
        ],
      },

      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
        "30": "7.5rem",
        "34": "8.5rem",
        "38": "9.5rem",
        "42": "10.5rem",
        "46": "11.5rem",
        "50": "12.5rem",
      },

      maxWidth: {
        "8xl": "88rem",
        "9xl": "96rem",
        prose: "65ch",
        "prose-lg": "72ch",
      },

      borderWidth: {
        "3": "3px",
        "6": "6px",
      },

      boxShadow: {
        "card-sm":
          "0 1px 3px 0 rgba(26, 26, 26, 0.08), 0 1px 2px -1px rgba(26, 26, 26, 0.06)",
        card: "0 4px 6px -1px rgba(26, 26, 26, 0.08), 0 2px 4px -2px rgba(26, 26, 26, 0.06)",
        "card-lg":
          "0 10px 15px -3px rgba(26, 26, 26, 0.08), 0 4px 6px -4px rgba(26, 26, 26, 0.06)",
        "card-xl":
          "0 20px 25px -5px rgba(26, 26, 26, 0.08), 0 8px 10px -6px rgba(26, 26, 26, 0.06)",
        "inner-gold": "inset 0 1px 0 0 rgba(201, 168, 76, 0.3)",
        newspaper: "2px 2px 0 0 rgba(26, 26, 26, 0.15)",
      },

      backgroundImage: {
        "gradient-gold":
          "linear-gradient(135deg, #C9A84C 0%, #DEC07A 50%, #C9A84C 100%)",
        "gradient-parchment":
          "linear-gradient(180deg, #FAFAF7 0%, #F5F0E8 100%)",
        "gradient-ink": "linear-gradient(180deg, #1a1a1a 0%, #333333 100%)",
        "noise-overlay":
          "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E\")",
      },

      animation: {
        "fade-in": "fadeIn 0.4s ease-in-out",
        "slide-up": "slideUp 0.4s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
        "ticker-scroll": "tickerScroll 40s linear infinite",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },

      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(8px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-8px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        tickerScroll: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },

      typography: {
        DEFAULT: {
          css: {
            "--tw-prose-body": "#1a1a1a",
            "--tw-prose-headings": "#1a1a1a",
            "--tw-prose-links": "#C9A84C",
            "--tw-prose-bold": "#1a1a1a",
            "--tw-prose-counters": "#555555",
            "--tw-prose-bullets": "#C9A84C",
            "--tw-prose-hr": "#E8E8E8",
            "--tw-prose-quotes": "#333333",
            "--tw-prose-quote-borders": "#C9A84C",
            "--tw-prose-captions": "#555555",
            "--tw-prose-code": "#1a1a1a",
            "--tw-prose-pre-code": "#FAFAF7",
            "--tw-prose-pre-bg": "#1a1a1a",
            "--tw-prose-th-borders": "#E8E8E8",
            "--tw-prose-td-borders": "#E8E8E8",
          },
        },
        invert: {
          css: {
            "--tw-prose-body": "#FAFAF7",
            "--tw-prose-headings": "#FAFAF7",
            "--tw-prose-links": "#DEC07A",
            "--tw-prose-bold": "#FAFAF7",
            "--tw-prose-counters": "#AAAAAA",
            "--tw-prose-bullets": "#DEC07A",
            "--tw-prose-hr": "#333333",
            "--tw-prose-quotes": "#CCCCCC",
            "--tw-prose-quote-borders": "#DEC07A",
            "--tw-prose-captions": "#AAAAAA",
          },
        },
      },

      screens: {
        xs: "475px",
        "3xl": "1920px",
      },

      zIndex: {
        "60": "60",
        "70": "70",
        "80": "80",
        "90": "90",
        "100": "100",
      },
    },
  },
  plugins: [],
};

export default config;
