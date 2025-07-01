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
    settings: {
      // TypeScript 경로 매핑 해결을 위한 설정
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
          project: "./tsconfig.json",
        },
        node: {
          extensions: [".js", ".jsx", ".ts", ".tsx"],
        },
      },
    },
    rules: {
      // Node.js 환경에서 추가 규칙
      ...tseslint.configs["recommended-type-checked"].rules,

      // Supabase와 같은 라이브러리에서 발생하는 타입 안전성 경고 완화
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-return": "off",

      // 함수 반환 타입 명시 (백엔드에서는 더 엄격하게)
      "@typescript-eslint/explicit-function-return-type": "warn",
      "@typescript-eslint/explicit-module-boundary-types": "warn",

      // Node.js에서 console.log는 일반적
      "no-console": "off",
      "no-undef": "off",
    },
  },

  // 설정 파일 및 스크립트는 더 관대하게
  {
    files: [
      "*.config.js",
      "*.config.mjs",
      "scripts/**/*.js",
      "scripts/**/*.ts",
    ],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/explicit-function-return-type": "off",
      // "@typescript-eslint/no-unsafe-assignment": "off",
      // "@typescript-eslint/no-unsafe-member-access": "off",
      // "@typescript-eslint/no-unsafe-call": "off",
      "no-console": "off",
    },
  },

  {
    files: ["**/supabase.ts"],
    rules: {
      "@typescript-eslint/consistent-type-definitions": "off",
      "@typescript-eslint/no-redundant-type-constituents": "off",
    },
  },
];
