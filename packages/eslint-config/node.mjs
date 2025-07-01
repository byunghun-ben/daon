import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";
import baseConfig from "./base.mjs";

/**
 * Node.js 환경용 ESLint 설정
 * 백엔드 및 서버사이드 프로젝트용
 */
export default [
  ...baseConfig,
  
  // Node.js 환경 설정
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        project: "./tsconfig.json", // 타입 체크를 위한 tsconfig 참조
      },
      globals: {
        // Node.js 전역 변수들
        console: "readonly",
        process: "readonly",
        Buffer: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        module: "readonly",
        require: "readonly",
        exports: "readonly",
        global: "readonly",
        globalThis: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
    },
    rules: {
      // Node.js 환경에서 추가 규칙
      ...tseslint.configs["recommended-type-checked"].rules,
      
      // 함수 반환 타입 명시 (백엔드에서는 더 엄격하게)
      "@typescript-eslint/explicit-function-return-type": "warn",
      "@typescript-eslint/explicit-module-boundary-types": "warn",
      
      // Node.js에서 console.log는 일반적
      "no-console": "off",
    },
  },

  // 설정 파일 및 스크립트는 더 관대하게
  {
    files: ["*.config.js", "*.config.mjs", "scripts/**/*.js", "scripts/**/*.ts"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/explicit-function-return-type": "off",
      "no-console": "off",
    },
  },
];