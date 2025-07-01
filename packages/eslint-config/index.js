/**
 * @daon/eslint-config 메인 엔트리 포인트
 *
 * 사용법:
 * - 기본 설정: require('@daon/eslint-config/base')
 * - Node.js: require('@daon/eslint-config/node')
 * - React Native: require('@daon/eslint-config/react-native')
 */

module.exports = {
  base: require("./base.mjs"),
  node: require("./node.mjs"),
  "react-native": require("./react-native.mjs"),
};
