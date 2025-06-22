# 다온(Daon) 프로젝트 작업 명세서

## 📋 프로젝트 개요

### 서비스명

**다온(Daon)** - 육아 기록 모바일 앱

### 목표

부모가 아이의 일상을 기록하고 관리할 수 있는 모바일 애플리케이션 개발

### 핵심 가치

- 아이의 기록이 쌓일수록 부모를 플랫폼에 락인시키는 형태
- 비정기적/정기적 기록을 통한 체계적인 육아 관리
- 다중 보호자 간의 정보 공유

## 🏗 기술 스택

### 아키텍처

- **모노레포**: pnpm + Turborepo
- **프론트엔드**: React Native (FSD 아키텍처)
- **백엔드**: Node.js (Express/Fastify)
- **데이터베이스**: Supabase (PostgreSQL + 실시간 기능)

### 프로젝트 구조

```
daon/
├── package.json                 # 루트 패키지 설정
├── pnpm-workspace.yaml         # pnpm 워크스페이스 설정
├── turbo.json                  # Turborepo 설정
├── packages/
│   ├── mobile/                 # React Native 앱
│   │   ├── package.json
│   │   ├── metro.config.js
│   │   ├── src/
│   │   │   ├── screens/        # 화면 컴포넌트
│   │   │   ├── components/     # 재사용 컴포넌트
│   │   │   ├── navigation/     # 네비게이션 설정
│   │   │   ├── store/          # 상태 관리
│   │   │   ├── services/       # API 서비스
│   │   │   └── utils/          # 유틸리티
│   │   ├── ios/                # iOS 설정
│   │   └── android/            # Android 설정
│   ├── backend/                # Node.js API 서버
│   │   ├── package.json
│   │   ├── src/
│   │   │   ├── routes/         # API 라우트
│   │   │   ├── controllers/    # 컨트롤러
│   │   │   ├── models/         # 데이터 모델
│   │   │   ├── middleware/     # 미들웨어
│   │   │   ├── services/       # 비즈니스 로직
│   │   │   └── utils/          # 유틸리티
│   │   ├── prisma/             # 데이터베이스 스키마
│   │   └── tests/              # 테스트
│   ├── shared/                 # 공유 타입 및 유틸리티
│   │   ├── package.json
│   │   ├── src/
│   │   │   ├── types/          # TypeScript 타입 정의
│   │   │   ├── constants/      # 상수
│   │   │   └── utils/          # 공유 유틸리티
│   │   └── index.ts
│   └── web/                    # 향후 웹 대시보드 (선택사항)
├── docs/                       # 문서
└── tools/                      # 빌드 도구 및 스크립트
```

## 🎯 핵심 기능 명세

### 1. 사용자 관리 (User Management)

#### 1.1 회원가입/로그인

- **기능**: 이메일/전화번호 기반 회원가입
- **인증**: JWT 토큰 기반 인증
- **소셜 로그인**: Google, Apple (향후)

#### 1.2 아이 프로필 관리

- **필수 정보**: 이름, 생년월일, 성별
- **선택 정보**: 사진, 출생 체중/신장
- **다중 아이**: 한 계정에 여러 아이 등록 가능

#### 1.3 보호자 관리

- **초대 시스템**: 이메일/고유코드로 다른 보호자 초대
- **권한 관리**: 관리자/보기전용 권한 구분
- **제한사항**: 무료 - 아이당 2명, 프리미엄 - 무제한

### 2. 활동 기록 (Activity Tracking)

#### 2.1 비정기적 기록

```typescript
interface Activity {
  id: string;
  childId: string;
  userId: string;
  type: "feeding" | "diaper" | "sleep" | "tummy_time" | "custom";
  timestamp: Date;
  data: ActivityData;
  notes?: string;
}

interface FeedingData {
  type: "breast" | "bottle" | "solid";
  amount?: number;
  duration?: number;
}

interface DiaperData {
  type: "wet" | "dirty" | "both";
}

interface SleepData {
  startTime: Date;
  endTime?: Date;
  quality?: "good" | "fair" | "poor";
}
```

#### 2.2 정기적 기록 (일기)

```typescript
interface DiaryEntry {
  id: string;
  childId: string;
  userId: string;
  date: Date;
  content: string;
  photos: string[];
  videos: string[];
  milestones: Milestone[];
}

interface Milestone {
  type: "first_smile" | "first_step" | "first_word" | "custom";
  description: string;
  achievedAt: Date;
}
```

### 3. 성장 추적 (Growth Tracking)

#### 3.1 신체 측정

```typescript
interface GrowthRecord {
  id: string;
  childId: string;
  recordedAt: Date;
  weight?: number;
  height?: number;
  headCircumference?: number;
}
```

#### 3.2 성장 차트

- WHO 표준 성장 곡선 비교
- 백분위수 계산 및 표시
- 성장 추세 분석

### 4. 인사이트 및 분석

#### 4.1 패턴 분석

- 수유/수면 패턴 인식
- 주/월별 활동 요약
- 성장 추세 분석

#### 4.2 리포트 생성

- 일/주/월별 활동 리포트
- PDF 내보내기 (프리미엄)
- 의료진 공유용 요약

## 📱 화면 설계

### 메인 네비게이션

1. **홈**: 오늘의 활동 요약
2. **기록**: 활동 기록 입력
3. **일기**: 일기 작성/조회
4. **성장**: 성장 차트 및 기록
5. **설정**: 프로필 및 앱 설정

### 주요 화면

- **스플래시 화면**
- **온보딩 화면** (3-4개 페이지)
- **로그인/회원가입**
- **아이 프로필 설정**
- **메인 대시보드**
- **활동 기록 화면**
- **일기 작성 화면**
- **성장 차트 화면**
- **설정 화면**

## 🔄 개발 단계

### Phase 1: 기본 인프라 (2주) - ✅ 완료

- [x] 모노레포 설정 (pnpm + Turborepo)
- [x] React Native FSD 아키텍처 적용
- [x] 공유 타입 정의 (Zod 스키마 기반)
- [x] 기본 UI 컴포넌트 시스템 구축
- [x] 백엔드 기본 구조
- [x] Supabase 데이터베이스 스키마 설계

### Phase 2: 사용자 관리 (3주) - ✅ 완료

- [x] 회원가입/로그인 API
- [x] JWT 인증 시스템
- [x] 사용자 프로필 관리
- [x] 아이 프로필 CRUD
- [x] 보호자 초대 시스템

### Phase 3: 모바일 앱 인증 및 프로필 (4주) - ✅ 완료

- [x] 모바일 인증 화면 구현 (로그인/회원가입)
- [x] 2단계 회원가입 시스템 (기본 정보 → 아이 프로필)
- [x] 아이 프로필 관리 화면 (생성/수정/삭제)
- [x] 초대 코드를 통한 기존 아이 참여 기능
- [x] 로그아웃 기능 및 세션 관리
- [x] AuthContext 기반 인증 상태 관리

### Phase 4: 활동 기록 기능 (4주) - ✅ 완료

- [x] TanStack Query 기반 서버 상태 관리 구축
- [x] Axios HTTP 클라이언트 도입 및 인터셉터 설정
- [x] 활동 기록 API (백엔드 완료)
- [x] 활동 기록 화면 UI 개선 (수유, 기저귀, 수면, 배밀이)
- [x] 실시간 활동 CRUD (생성/조회/수정/삭제)
- [x] 활동 목록 및 필터링 (ActivityListScreen)
- [x] HomeScreen 실시간 대시보드 구현
- [x] 데이터 동기화 및 캐싱 (pull-to-refresh, 자동 invalidation)

### Phase 5: 일기 및 성장 기능 (3주)

- [ ] 일기 작성 화면 구현
- [ ] 사진/동영상 업로드 기능
- [ ] 마일스톤 기록 UI
- [ ] 성장 기록 차트 화면
- [ ] 기본 분석 및 인사이트

### Phase 6: 고급 기능 및 최적화 (2주)

- [ ] 오프라인 지원 및 데이터 동기화
- [ ] 성능 최적화 및 캐싱
- [ ] 푸시 알림 시스템
- [ ] 데이터 내보내기 기능

### Phase 7: 프리미엄 기능 (2주)

- [ ] 구독 시스템 구현
- [ ] 고급 분석 및 리포트
- [ ] 추가 보호자 지원 (무제한)
- [ ] 클라우드 백업 및 복원

## 🧪 테스트 전략

### 백엔드 테스트

- **단위 테스트**: Jest + Supertest
- **통합 테스트**: API 엔드포인트 테스트
- **E2E 테스트**: 주요 사용자 플로우

### 모바일 테스트

- **단위 테스트**: Jest + React Native Testing Library
- **컴포넌트 테스트**: Storybook
- **E2E 테스트**: Detox

## 🚀 배포 전략

### 개발 환경

- **백엔드**: Supabase + Vercel/Railway
- **데이터베이스**: Supabase (PostgreSQL + 실시간)
- **파일 저장**: Supabase Storage

### 프로덕션 배포

- **백엔드**: AWS/GCP
- **모바일**: App Store/Google Play Store
- **CI/CD**: GitHub Actions

## 📊 성능 목표

### 백엔드

- API 응답 시간: < 200ms
- 동시 사용자: 1000+ 지원
- 데이터베이스 쿼리: < 100ms

### 모바일

- 앱 시작 시간: < 3초
- 화면 전환: < 500ms
- 오프라인 지원: 필수 기능

## 🔒 보안 요구사항

### 데이터 보호

- 개인정보 암호화
- HTTPS 통신 필수
- JWT 토큰 만료 시간 관리

### 규정 준수

- GDPR 준수
- 아동 데이터 보호 규정
- 개인정보 처리방침

## 📈 비즈니스 메트릭

### 사용자 메트릭

- DAU (Daily Active Users)
- 기록 작성 빈도
- 앱 사용 시간

### 비즈니스 메트릭

- 프리미엄 전환율
- 사용자 유지율
- 추천율 (NPS)

---

**이 명세서는 개발 진행에 따라 지속적으로 업데이트됩니다.**
