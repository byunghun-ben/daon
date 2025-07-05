/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./features/**/*.{js,jsx,ts,tsx}",
    "./shared/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./entities/**/*.{js,jsx,ts,tsx}",
    "./widgets/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // 프라이머리 색상
        primary: "var(--color-primary)",
        "primary-dark": "var(--color-primary-dark)",
        secondary: "var(--color-secondary)",
        
        // 배경 및 표면 색상
        background: "var(--color-background)",
        surface: "var(--color-surface)",
        "surface-secondary": "var(--color-surface-secondary)",
        
        // 텍스트 색상
        text: "var(--color-text)",
        "text-secondary": "var(--color-text-secondary)",
        "text-muted": "var(--color-text-muted)",
        
        // 테두리 색상
        border: "var(--color-border)",
        
        // 상태 색상
        success: "var(--color-success)",
        warning: "var(--color-warning)",
        error: "var(--color-error)",
        info: "var(--color-info)",
        
        // 베이비 테마 색상
        baby: {
          pink: "var(--color-baby-pink)",
          blue: "var(--color-baby-blue)",
          yellow: "var(--color-baby-yellow)",
          green: "var(--color-baby-green)",
          purple: "var(--color-baby-purple)",
        },
        
        // 활동 색상
        feeding: "var(--color-feeding)",
        diaper: "var(--color-diaper)",
        sleep: "var(--color-sleep)",
        "tummy-time": "var(--color-tummy-time)",
        custom: "var(--color-custom)",
      },
      spacing: {
        xs: "4px",
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "20px",
        xxl: "24px",
      },
      borderRadius: {
        sm: "4px",
        md: "8px",
        lg: "12px",
        xl: "16px",
      },
      fontSize: {
        title: ["28px", { fontWeight: "700" }],
        subtitle: ["16px", { lineHeight: "20px" }],
        h3: ["20px", { fontWeight: "700" }],
        body1: ["16px", { lineHeight: "22px" }],
        body2: ["14px", { lineHeight: "normal" }],
        caption: ["12px", { lineHeight: "normal" }],
        button: ["16px", { fontWeight: "700" }],
      },
    },
  },
  plugins: [],
};
