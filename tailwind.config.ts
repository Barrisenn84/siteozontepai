/** @type {import('tailwindcss').Config} */
export default {
  content: {
    index: ["index.html"],
    files: ["src/**/*.{ts,tsx,js,jsx}"],
  },
  theme: {
    extend: {
      effects: {
        "liquid-glass": 
          "rgba(255, 255, 255, 0.3); /* Fundo translúcido efeito vidro líquido */",
        "liquid-glass-border": 
          "1px solid rgba(255, 255, 255, 0.2); /* Borda fluida vidro líquido */",
      },
    },
  },
};