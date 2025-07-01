// 타입 선언 파일 - eslint-config-expo 모듈에 대한 타입 정의
declare module "eslint-config-expo/flat.js" {
  import type { Linter } from "eslint";

  const config: Linter.Config[];
  export default config;
}

declare module "eslint-config-expo/flat" {
  import type { Linter } from "eslint";

  const config: Linter.Config[];
  export default config;
}
