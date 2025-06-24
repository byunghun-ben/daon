module.exports = {
  root: true,
  extends: ["@react-native/eslint-config"],
  rules: {
    // 기본적인 규칙들만 추가
    "no-console": "warn",
    "prefer-const": "error",
    "no-var": "error",
    // 미사용 import 및 변수 검사
    "no-unused-vars": "off", // TypeScript에서는 @typescript-eslint/no-unused-vars 사용
    "@typescript-eslint/no-unused-vars": [
      "warn",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        ignoreRestSiblings: true,
      },
    ],
    // import 정리 관련
    "import/no-unused-modules": "warn",
    "import/order": [
      "error",
      {
        groups: [
          "builtin",
          "external",
          "internal",
          "parent",
          "sibling",
          "index",
        ],
        "newlines-between": "never",
        alphabetize: {
          order: "asc",
          caseInsensitive: true,
        },
      },
    ],
  },
  overrides: [
    {
      files: ["**/__tests__/**/*", "**/*.test.*", "**/*.spec.*"],
      env: {
        jest: true,
      },
      rules: {
        "no-console": "off",
      },
    },
  ],
  ignorePatterns: ["node_modules/", "android/", "ios/", "*.config.js"],
};
