# 다온(Daon) - 육아 기록 모바일 앱

부모가 아이의 일상 활동, 성장, 발달 과정을 기록하고 관리할 수 있는 종합 육아 앱입니다.

## 🍼 서비스 개요

**다온**은 부모가 디지털 육아일기를 작성하고 아이의 발달 과정을 추적할 수 있는 모바일 애플리케이션입니다. 아이의 기록이 쌓일수록 부모를 플랫폼에 점차 락인시키는 형태의 몰입감 있는 서비스를 제공합니다.

### 핵심 기능

#### 기본 기능

- **육아일기**: 일상 관찰 내용과 성장 기록을 위한 디지털 다이어리
- **활동 기록**: 수유, 기저귀 교체, 수면 패턴 등 비정기적 활동 기록
- **정기 기록**: 주기적인 일기 작성 및 체크인
- **다중 부모 지원**: 여러 보호자가 함께 육아 책임을 공유

#### 사용자 관리

- 개별 부모 회원가입 및 인증
- 아이 프로필 생성 및 관리
- 보호자 초대 시스템 (기본적으로 아이당 최대 2명)
- 프리미엄 구독을 통한 추가 보호자 슬롯 제공

## 🏗 기술 아키텍처

### 모노레포 구조

```
daon/
├── apps/
│   ├── mobile/          # 새로운 Expo 모바일 앱 (Expo Router)
│   └── backend/         # Node.js API 서버
├── packages/
│   ├── mobile/          # 기존 React Native 앱 (FSD 아키텍처) - 레거시
│   ├── shared/          # 공유 타입 및 유틸리티 (Zod 스키마)
│   └── web/             # 향후 웹 대시보드 (선택사항)
├── docs/                # 문서
└── tools/               # 빌드 도구 및 스크립트
```

### 모바일 앱 아키텍처 (FSD - Feature-Sliced Design)

```
packages/mobile/src/
├── app/                 # 앱 설정 및 전역 구성
│   └── navigation/      # 네비게이션 설정
├── pages/               # 페이지 컴포넌트
│   ├── home/           # 홈 화면
│   ├── record/         # 활동 기록 화면
│   ├── diary/          # 일기 화면
│   ├── growth/         # 성장 차트 화면
│   └── settings/       # 설정 화면
├── widgets/            # 복합 UI 블록
├── features/           # 기능별 비즈니스 로직
│   ├── record-activity/
│   ├── write-diary/
│   └── track-growth/
├── entities/           # 도메인 엔티티
│   ├── child/
│   ├── activity/
│   ├── diary-entry/
│   └── growth-record/
└── shared/             # 공유 리소스
    ├── ui/             # 공유 UI 컴포넌트
    ├── types/          # Zod 스키마 및 타입
    ├── config/         # 설정 및 테마
    ├── lib/            # 유틸리티 함수
    └── api/            # API 클라이언트
```

### 기술 스택

#### 프론트엔드 (모바일)

**새로운 Expo 앱 (apps/mobile)**:
- **프레임워크**: Expo SDK 53 + React Native 0.79
- **라우팅**: Expo Router v5 (file-based routing)
- **New Architecture**: React Native New Architecture 활성화
- **빌드/배포**: EAS (Expo Application Services)
- **웹 지원**: Metro 번들러를 통한 웹 빌드

**기존 React Native 앱 (packages/mobile - 레거시)**:
- **프레임워크**: React Native 0.80
- **아키텍처**: Feature-Sliced Design (FSD)
- **상태 관리**: Zustand / Tanstack Query
- **내비게이션**: React Navigation v7
- **타입 검증**: Zod 스키마 + TypeScript
- **UI 컴포넌트**: 자체 구현된 Design System
- **오프라인 저장소**: AsyncStorage / SQLite

#### 백엔드

- **런타임**: Node.js
- **프레임워크**: Express.js / Fastify
- **데이터베이스**: Supabase (PostgreSQL + 실시간 기능)
- **인증**: Supabase Auth (JWT 기반)
- **파일 저장소**: Supabase Storage
- **푸시 알림**: Firebase Cloud Messaging

#### 공유 라이브러리

- **타입 시스템**: Zod 스키마 우선 접근법
- **코드 공유**: TypeScript 타입 정의
- **유효성 검증**: Zod 런타임 검증

#### 개발 도구

- **패키지 매니저**: pnpm (모노레포 지원)
- **빌드 도구**: Turborepo
- **테스트**: Jest + React Native Testing Library
- **CI/CD**: GitHub Actions
- **코드 품질**: ESLint + Prettier + TypeScript

## 👶 핵심 기능

### 1. 활동 추적 (비정기적 기록)

- **수유**: 시간, 양, 종류 (모유/분유/이유식)
- **기저귀 교체**: 시간, 종류 (소변/대변), 메모
- **수면**: 시작/종료 시간, 수면 품질 메모
- **배 뒤집기 시간**: 지속 시간 및 관찰 내용
- **사용자 정의 활동**: 사용자가 정의한 추적 카테고리

### 2. 일기 및 마일스톤 (정기적 기록)

- **일상 일기**: 사진과 동영상이 포함된 텍스트 기록
- **성장 기록**: 첫 미소, 첫 걸음마, 첫 말 등
- **신체 성장**: 키, 몸무게, 머리둘레
- **사진 타임라인**: 시각적 성장 과정

### 3. 인사이트 및 분석

- **패턴 인식**: 수면 및 수유 패턴 분석
- **성장 차트**: WHO 표준 성장 백분위수
- **활동 요약**: 일별, 주별, 월별 리포트
- **성장 타임라인**: 시각적 발달 진행 상황

### 4. 향후 연동 기능

- **웨어러블 기기**: Apple Watch, 스마트 베이비 모니터
- **IoT 연동**: 스마트 체중계, 체온계
- **음성 기록**: 빠른 음성-텍스트 변환 입력
- **의료진 연동**: 소아과 방문 기록

## 👨‍👩‍👧‍👦 사용자 관리

### 회원가입 및 설정

1. 부모가 이메일/전화번호 인증으로 계정 생성
2. 아이 프로필 설정 (이름, 생년월일, 사진)
3. 이메일 또는 고유 코드로 파트너/보호자 초대
4. 초대 수락 및 아이 프로필 연결

### 보호자 관리

- **무료 티어**: 아이당 최대 2명의 보호자
- **프리미엄 티어**: 추가 보호자 슬롯 (조부모, 육아도우미 등)
- 역할 기반 권한 (보기 전용 vs. 전체 접근)
- 활동 기록자 표시 (누가 무엇을 기록했는지)

## 💰 수익화 전략

### 무료 기능

- 기본 활동 추적
- 사진이 포함된 일기 작성
- 아이당 2개의 보호자 계정
- 기본 분석 및 인사이트
- 1GB 클라우드 저장공간

### 프리미엄 기능 (월 4,900원)

- 무제한 보호자 계정
- 고급 분석 및 AI 인사이트
- 무제한 클라우드 저장공간
- 동영상 기록
- 데이터 내보내기 (PDF 리포트, CSV)
- 우선 고객 지원
- 신기능 우선 접근

## ✨ 최신 개발 현황 (2024년 6월)

### 🎉 주요 완료 사항

#### 인증 및 사용자 관리
- **2단계 회원가입 시스템**: 기본 회원가입 → 아이 프로필 생성/참여
- **보호자 초대 시스템**: 초대 코드를 통한 기존 아이 프로필 참여
- **JWT 기반 인증**: Supabase Auth 통합으로 안전한 세션 관리
- **로그아웃 기능**: 서버 세션 무효화 및 로컬 토큰 정리

#### 활동 기록 시스템 (Phase 4 완료)
- **TanStack Query 도입**: 서버 상태 관리, 캐싱, 실시간 동기화
- **Axios HTTP 클라이언트**: 인터셉터 기반 인증 처리 및 에러 핸들링  
- **활동 CRUD**: 수유, 기저귀, 수면, 배밀이 등 완전한 생성/조회/수정/삭제
- **실시간 대시보드**: HomeScreen에서 오늘 활동 요약 및 최근 기록 표시
- **활동 목록 및 필터링**: ActivityListScreen에서 전체 활동 조회
- **자동 데이터 동기화**: Pull-to-refresh 및 mutation 후 자동 캐시 업데이트

#### 모바일 앱 UI/UX
- **Feature-Sliced Design (FSD) 아키텍처**: 확장 가능한 코드 구조
- **테마 시스템**: 일관된 디자인 및 다크모드 대응 준비
- **반응형 UI 컴포넌트**: Button, Input, Card 등 재사용 가능한 컴포넌트
- **타입 안전성**: Zod 스키마 기반 런타임 검증

#### 백엔드 API
- **RESTful API**: Express.js 기반 확장 가능한 API 구조
- **데이터베이스**: Supabase PostgreSQL 스키마 최적화
- **타입 검증**: Zod를 통한 요청/응답 검증
- **인증 미들웨어**: JWT 토큰 검증 및 사용자 컨텍스트 제공

### 🔧 기술적 성과

- **서버 상태 관리**: TanStack Query로 캐싱, 동기화, 낙관적 업데이트 구현
- **타입 안전성**: `as` 타입 단언 없이 완전한 타입 안전성 확보
- **HTTP 클라이언트**: Axios 인터셉터로 자동 인증 토큰 처리 및 에러 핸들링
- **실시간 UI**: 데이터 변경 시 즉시 UI 업데이트 및 Pull-to-refresh
- **에러 처리**: 체계적인 에러 처리 및 사용자 피드백
- **모노레포**: Turborepo + pnpm으로 효율적인 개발 환경
- **코드 품질**: ESLint + Prettier + TypeScript 설정

## 🚀 개발 로드맵

### Phase 1: 기본 인프라 (2주) - ✅ 완료

- [x] 모노레포 설정 (pnpm + Turborepo)
- [x] React Native 기본 설정 및 FSD 아키텍처 적용
- [x] 공유 타입 정의 (Zod 스키마 기반)
- [x] 기본 UI 컴포넌트 시스템 구축
- [x] 백엔드 기본 구조
- [x] 데이터베이스 스키마 설계

### Phase 2: 사용자 관리 (3주) - ✅ 완료

- [x] 회원가입/로그인 API
- [x] JWT 인증 시스템 (Supabase Auth)
- [x] 사용자 프로필 관리
- [x] 아이 프로필 CRUD (임신 중 출산예정일 지원)
- [x] 보호자 초대 시스템

### Phase 3: 기본 기록 기능 (4주) - ✅ 완료

- [x] 활동 기록 API (수유, 기저귀, 수면, 배밀이)
- [x] 활동 데이터 검증 및 타입 정의 (Zod 스키마)
- [x] 활동 조회 및 필터링 API
- [x] 성장 기록 API (키, 몸무게, 머리둘레)
- [x] 일기 작성 기본 API
- [x] 마일스톤 기록 시스템

### Phase 4: 활동 기록 기능 (4주) - ✅ 완료

- [x] 모바일 앱 기본 UI 구현 (FSD 아키텍처)
- [x] 인증 화면 구현 (로그인/회원가입)
- [x] 아이 프로필 관리 화면 (2단계 등록 시스템 포함)
- [x] 보호자 초대 코드 시스템
- [x] 로그아웃 기능 구현
- [x] TanStack Query 기반 서버 상태 관리 구현
- [x] Axios HTTP 클라이언트 도입
- [x] 활동 기록 화면 (수유, 기저귀, 수면, 배밀이)
- [x] 실시간 활동 CRUD (생성/조회/수정/삭제)
- [x] 활동 목록 및 필터링
- [x] HomeScreen 실시간 대시보드 구현
- [x] 데이터 동기화 및 캐싱

### Phase 5: 고급 기능 및 분석 (3주)

- [ ] 활동 패턴 분석 및 인사이트
- [ ] 성장 차트 WHO 표준 비교
- [ ] 푸시 알림 및 리마인더
- [ ] 데이터 내보내기 (PDF 리포트)
- [ ] 사진/동영상 업로드 기능

### Phase 6: 프리미엄 기능 (2주)

- [ ] 구독 시스템 구현
- [ ] 고급 분석 기능
- [ ] 추가 보호자 지원 (무제한)
- [ ] 클라우드 백업 및 복원

### 향후 확장 계획

- [ ] Apple Watch 컴패니언 앱
- [ ] 보호자용 웹 대시보드
- [ ] AI 기반 인사이트 및 추천
- [ ] 의료진과의 공유 기능
- [ ] 다국어 지원

## 🛠 시작하기

### 사전 요구사항

- Node.js 24+ 및 pnpm
- React Native 개발 환경
- PostgreSQL 데이터베이스 (Supabase)
- iOS/Android 개발 도구

### 설치

```bash
# 리포지토리 클론
git clone https://github.com/your-org/daon.git
cd daon

# 의존성 설치
pnpm install

# 환경 변수 설정
cp .env.example .env

# 개발 서버 시작
pnpm dev
```

### 개발 명령어

```bash
# 모든 서비스 시작
pnpm dev

# 새로운 Expo 앱 (apps/mobile)
cd apps/mobile
pnpm start          # Expo 개발 서버
pnpm ios           # iOS
pnpm android       # Android
pnpm web           # 웹 브라우저

# 기존 React Native 앱 (packages/mobile - 레거시)
cd packages/mobile
pnpm dev           # Metro 번들러
pnpm ios           # iOS 시뮬레이터
pnpm android       # Android 에뮬레이터

# 백엔드 실행
cd apps/backend
pnpm dev

# 테스트 실행
pnpm test

# 프로덕션 빌드
pnpm build
```

### EAS 배포 명령어

```bash
# 모바일 디렉토리로 이동
cd packages/mobile

# 개발 빌드 (내부 테스트용)
pnpm build:development

# 프리뷰 빌드 (베타 테스트용)
pnpm build:preview

# 프로덕션 빌드 (배포용)
pnpm build:production

# 모든 플랫폼 프로덕션 빌드
pnpm build:all

# OTA 업데이트 배포
pnpm update

# 앱스토어 제출
pnpm submit:ios      # App Store
pnpm submit:android  # Google Play
```

### 핵심 기술 스택

#### 프론트엔드 (모바일)
- **React Native 0.80** + TypeScript
- **TanStack Query** - 서버 상태 관리 및 캐싱
- **Axios** - HTTP 클라이언트
- **Feature-Sliced Design (FSD)** - 아키텍처 패턴
- **Zustand** - 로컬 상태 관리
- **React Navigation v7** - 네비게이션

#### 백엔드
- **Node.js + Express.js**
- **Supabase** - PostgreSQL + 실시간 기능 + 인증
- **Zod** - 스키마 검증 및 타입 안전성
- **JWT** - 인증 토큰

#### 개발 도구
- **pnpm** + **Turborepo** - 모노레포 관리
- **ESLint + Prettier** - 코드 품질
- **Jest** - 테스트 프레임워크

#### 배포 및 CI/CD
- **EAS (Expo Application Services)** - 클라우드 빌드 및 배포
- **EAS Build** - iOS/Android 자동 빌드
- **EAS Update** - OTA(Over-The-Air) 업데이트
- **EAS Submit** - 앱스토어 자동 제출

## 📱 플랫폼 지원

### 초기 출시

- iOS 13+
- Android 8+ (API level 26)

### 향후 플랫폼

- Apple Watch (watchOS 7+)
- 웹 대시보드 (반응형)
- iPad 최적화 인터페이스

## 🔒 개인정보 보호 및 보안

- GDPR 및 CCPA 준수
- 민감한 데이터의 종단간 암호화
- 기기 내 로컬 데이터 암호화
- JWT를 통한 안전한 API 인증
- 정기적인 보안 감사 및 업데이트
- 아동 데이터에 대한 부모 동의

## 📄 라이선스

이 프로젝트는 독점 소프트웨어입니다. 모든 권리가 보유됩니다.

## 🤝 기여하기

이것은 비공개 프로젝트입니다. 기여 가이드라인은 개발팀에 문의해 주세요.

---

**다온(Daon)** - 한국어로 "함께 모이다"라는 뜻 - 공유된 육아 경험을 통해 가족을 하나로 모으는 서비스
