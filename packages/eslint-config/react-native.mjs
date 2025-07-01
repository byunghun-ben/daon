import expoConfig from "eslint-config-expo/flat.js";

/**
 * React Native/Expo 환경용 ESLint 설정
 * 모바일 앱 프로젝트용
 */
export default [
  // Expo의 기본 설정 (React Native 최적화)
  ...expoConfig,
  
  // 기본 설정 적용 (base 설정의 일부만 선택적으로 적용)
  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      // TypeScript 엄격한 규칙들
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/consistent-type-definitions": ["error", "interface"],
      
      // React Native에서 유용한 규칙들
      "prefer-const": "error",
      "no-var": "error",
      "object-shorthand": "error",
      "prefer-template": "error",
      
      // React Native 환경에서는 console 허용
      "no-console": "off",
      
      // React hooks 관련 (Expo config에서 제공됨)
      // 추가적인 React Native 특화 규칙들은 여기에...
    },
  },

  // React Native 환경 변수들
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      globals: {
        // React Native 전역 변수들
        __DEV__: "readonly",
        window: "readonly",
        document: "readonly",
        navigator: "readonly",
        fetch: "readonly",
        console: "readonly",
        global: "readonly",
        globalThis: "readonly",
      },
    },
  },

  // Metro bundler 및 React Native 특화 파일들 제외
  {
    ignores: [
      "dist/**",
      "build/**",
      "node_modules/**",
      "android/**",
      "ios/**",
      ".expo/**",
      "expo-plugins/**",
      "metro.config.js",
      "babel.config.js",
    ],
  },
];