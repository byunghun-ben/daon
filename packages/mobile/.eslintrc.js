module.exports = {
  root: true,
  extends: ["@react-native/eslint-config"],
  rules: {
    // 기본적인 규칙들만 추가
    "no-console": "warn",
    "prefer-const": "error",
    "no-var": "error",
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
