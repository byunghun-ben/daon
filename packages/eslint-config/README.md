# @daon/eslint-config

다온 프로젝트를 위한 공유 ESLint 설정 패키지입니다.

## 설치

```bash
pnpm add -D @daon/eslint-config
```

## 사용법

### 기본 설정 (Base)

모든 TypeScript 프로젝트에서 사용하는 기본 설정:

```javascript
// eslint.config.mjs
import baseConfig from "@daon/eslint-config/base";

export default baseConfig;
```

### Node.js 설정

백엔드 프로젝트용 설정:

```javascript
// eslint.config.mjs
import nodeConfig from "@daon/eslint-config/node";

export default nodeConfig;
```

### React Native 설정

모바일 앱 프로젝트용 설정:

```javascript
// eslint.config.js
const reactNativeConfig = require("@daon/eslint-config/react-native");

module.exports = reactNativeConfig;
```

## 포함된 규칙

### 공통 규칙 (Base)

- **TypeScript**: `@typescript-eslint/recommended`
- **타입 안전성**: `no-explicit-any`, `consistent-type-imports` 등
- **코드 품질**: `prefer-const`, `object-shorthand`, `prefer-template` 등
- **Import 정렬**: `sort-imports`
- **Prettier 호환**: `eslint-config-prettier`

### Node.js 추가 규칙

- **타입 체크**: `@typescript-eslint/recommended-type-checked`
- **함수 타입**: `explicit-function-return-type`, `explicit-module-boundary-types`
- **Node.js 글로벌**: `process`, `Buffer`, `__dirname` 등

### React Native 추가 규칙

- **Expo 설정**: `eslint-config-expo`
- **React Native 글로벌**: `__DEV__`, `fetch` 등
- **React/JSX 규칙**: Expo 설정에서 제공

## 개발자 가이드

새로운 규칙을 추가하거나 기존 규칙을 수정할 때는 다음을 고려하세요:

1. **일관성**: 모든 프로젝트에서 동일한 스타일을 유지
2. **점진적 적용**: 너무 엄격한 규칙은 경고로 시작
3. **환경 고려**: 각 환경(Node.js, React Native)의 특성 반영
4. **팀 논의**: 규칙 변경 시 팀원들과 협의

## 규칙 비활성화

특정 파일에서 규칙을 비활성화해야 할 때:

```javascript
/* eslint-disable @typescript-eslint/no-explicit-any */
const data: any = getSomeData();
/* eslint-enable @typescript-eslint/no-explicit-any */
```

또는 특정 라인만:

```javascript
const data: any = getSomeData(); // eslint-disable-line @typescript-eslint/no-explicit-any
```
