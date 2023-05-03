import { type Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
    },
  },
  variants: {
    translate: ['hover', 'focus'],
    transform: ['hover', 'focus'],
  },
  plugins: [],
} satisfies Config;
