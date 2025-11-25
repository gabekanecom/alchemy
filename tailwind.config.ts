import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        // Alchemy Brand Colors - White/Black/Gold Theme
        gold: {
          50: "#FFF9E6",
          100: "#FFF0CC",
          200: "#FFE699",
          300: "#FFDB66",
          400: "#FFD133",
          500: "#FFB800",
          600: "#FFA000",
          700: "#FF8C00",
          800: "#CC7000",
          900: "#995400",
        },
        grey: {
          50: "#FAFAFA",
          100: "#F5F5F5",
          200: "#E5E5E5",
          300: "#D4D4D4",
          400: "#A6A6A6",
          500: "#737373",
          600: "#525252",
          700: "#404040",
          800: "#262626",
          850: "#1A1A1A",
          900: "#171717",
          950: "#0A0A0A",
        },
      },
      backgroundImage: {
        "gradient-gold": "linear-gradient(135deg, #FFB800 0%, #FFA000 50%, #FF8C00 100%)",
        "gradient-gold-subtle": "linear-gradient(180deg, rgba(255, 184, 0, 0.05) 0%, transparent 100%)",
        "gradient-gold-radial": "radial-gradient(circle, rgba(255, 184, 0, 0.15) 0%, transparent 70%)",
      },
      boxShadow: {
        "gold-sm": "0 0 10px rgba(255, 184, 0, 0.2)",
        "gold-md": "0 4px 20px rgba(255, 184, 0, 0.15)",
        "gold-lg": "0 8px 40px rgba(255, 184, 0, 0.25)",
      },
    },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
};

export default config;
