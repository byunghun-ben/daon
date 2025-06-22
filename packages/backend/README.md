# 다온(Daon) Backend API

부모가 아이의 일상 활동, 성장, 발달 과정을 기록하고 관리할 수 있는 육아 기록 앱의 백엔드 API 서버입니다.

## 🚀 기술 스택

- **Runtime**: Node.js 24+
- **Framework**: Express.js
- **Database**: Supabase (PostgreSQL + 실시간 기능)
- **Authentication**: Supabase Auth (JWT 기반)
- **Type Safety**: TypeScript + Zod 스키마 검증
- **Architecture**: RESTful API
- **Code Style**: ESLint + Prettier

## 📁 프로젝트 구조

```
packages/backend/
├── src/
│   ├── controllers/           # API 엔드포인트 핸들러
│   │   ├── auth.controller.ts        # 인증 관련 API
│   │   ├── children.controller.ts    # 아이 프로필 관리 API
│   │   ├── activities.controller.ts  # 활동 기록 API
│   │   ├── diary.controller.ts       # 일기 작성 API
│   │   ├── growth.controller.ts      # 성장 기록 API
│   │   └── guardians.controller.ts   # 보호자 관리 API
│   ├── middleware/            # Express 미들웨어
│   │   └── auth.ts                   # JWT 인증 미들웨어
│   ├── routes/               # API 라우트 정의
│   ├── utils/                # 유틸리티 함수
│   │   ├── auth-handler.ts           # 인증된 핸들러 래퍼
│   │   └── logger.ts                 # 로깅 유틸리티
│   ├── lib/                  # 외부 라이브러리 설정
│   │   └── supabase.ts               # Supabase 클라이언트 설정
│   ├── types/                # TypeScript 타입 정의
│   │   └── supabase.ts               # Supabase 생성 타입
│   └── index.ts              # 메인 서버 엔트리포인트
├── package.json
├── tsconfig.json
└── README.md
```

## 🔧 개발 환경 설정

### 사전 요구사항

- Node.js 24+
- pnpm
- Supabase 프로젝트

### 설치 및 실행

```bash
# 의존성 설치
pnpm install

# 환경 변수 설정
cp .env.example .env

# 개발 서버 시작
pnpm dev

# 프로덕션 빌드
pnpm build

# 프로덕션 실행
pnpm start
```

### 환경 변수

```env
# Supabase 설정
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# 서버 설정
PORT=3000
NODE_ENV=development
```

## 📊 데이터베이스 구조

### 1. **users** - 사용자 테이블

사용자 계정 정보를 관리하는 핵심 테이블입니다.

| 필드명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| `id` | UUID | PRIMARY KEY | Supabase Auth에서 생성된 사용자 ID |
| `email` | TEXT | NOT NULL, UNIQUE | 사용자 이메일 (로그인 ID) |
| `name` | TEXT | NULLABLE | 사용자 이름 |
| `avatar_url` | TEXT | NULLABLE | 프로필 이미지 URL |
| `phone` | TEXT | NULLABLE | 전화번호 |
| `registration_status` | TEXT | NOT NULL, DEFAULT 'incomplete' | 회원가입 상태 (incomplete/completed) |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 계정 생성 시간 |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 최종 수정 시간 |

**특징:**
- Supabase Auth와 연동되어 인증 관리
- 2단계 회원가입 시스템 지원 (기본 정보 → 아이 프로필)
- `registration_status`로 온보딩 완료 여부 추적

### 2. **children** - 아이 프로필 테이블

각 가정의 아이 정보를 저장하는 테이블입니다.

| 필드명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| `id` | UUID | PRIMARY KEY | 아이 고유 ID |
| `name` | TEXT | NOT NULL | 아이 이름 |
| `birth_date` | DATE | NOT NULL | 생년월일 (미래 날짜 허용 - 임신 중) |
| `gender` | TEXT | NOT NULL | 성별 (male/female) |
| `photo_url` | TEXT | NULLABLE | 아이 사진 URL |
| `birth_weight` | DECIMAL(5,2) | NULLABLE | 출생 체중 (kg) |
| `birth_height` | DECIMAL(5,2) | NULLABLE | 출생 신장 (cm) |
| `owner_id` | UUID | NOT NULL, FK → users.id | 소유자 (주 보호자) ID |
| `invite_code` | TEXT | UNIQUE, NULLABLE | 보호자 초대 코드 |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 프로필 생성 시간 |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 최종 수정 시간 |

**특징:**
- 한 사용자가 여러 아이 프로필 관리 가능
- `invite_code`를 통한 다른 보호자 초대 시스템
- 임신 중 아이의 경우 미래 출산예정일 입력 가능

### 3. **child_guardians** - 보호자 관계 테이블

아이와 보호자 간의 관계를 관리하는 다대다 연결 테이블입니다.

| 필드명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| `id` | UUID | PRIMARY KEY | 관계 고유 ID |
| `child_id` | UUID | NOT NULL, FK → children.id | 아이 ID |
| `user_id` | UUID | NOT NULL, FK → users.id | 보호자 ID |
| `role` | TEXT | NOT NULL, DEFAULT 'guardian' | 역할 (owner/guardian/viewer) |
| `invited_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 초대 시간 |
| `accepted_at` | TIMESTAMPTZ | NULLABLE | 초대 수락 시간 (NULL이면 대기 중) |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 관계 생성 시간 |

**역할 설명:**
- **owner**: 아이 프로필 소유자 (생성자), 모든 권한
- **guardian**: 일반 보호자, 기록 작성/수정 가능
- **viewer**: 보기 전용, 기록 조회만 가능

**특징:**
- 복합 UNIQUE 제약조건: (child_id, user_id)
- 초대 승인 시스템: `accepted_at`이 NULL이면 대기 중
- 권한 기반 접근 제어 지원

### 4. **activities** - 활동 기록 테이블

아이의 일상 활동을 기록하는 핵심 테이블입니다.

| 필드명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| `id` | UUID | PRIMARY KEY | 활동 기록 고유 ID |
| `child_id` | UUID | NOT NULL, FK → children.id | 아이 ID |
| `user_id` | UUID | NOT NULL, FK → users.id | 기록자 ID |
| `type` | TEXT | NOT NULL | 활동 타입 (feeding/diaper/sleep/tummy_time/custom) |
| `timestamp` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 활동 발생 시간 |
| `data` | JSONB | NOT NULL | 활동별 상세 데이터 |
| `notes` | TEXT | NULLABLE | 추가 메모 |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 기록 생성 시간 |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 최종 수정 시간 |

**활동 타입별 `data` 구조:**

```typescript
// 수유 (feeding)
{
  "type": "breast" | "bottle" | "solid",
  "amount"?: number,        // ml 단위
  "duration"?: number,      // 분 단위
  "side"?: "left" | "right" | "both"
}

// 기저귀 (diaper)
{
  "type": "wet" | "dirty" | "both"
}

// 수면 (sleep)
{
  "startedAt": "2024-01-01T10:00:00Z",
  "endedAt"?: "2024-01-01T12:00:00Z",
  "quality"?: "good" | "fair" | "poor"
}

// 배밀이 (tummy_time)
{
  "duration": number        // 분 단위
}

// 사용자 정의 (custom)
{
  [key: string]: any        // 자유 형식
}
```

**특징:**
- JSONB를 활용한 유연한 데이터 구조
- 인덱싱: child_id, type, timestamp에 복합 인덱스
- 실시간 대시보드를 위한 효율적 쿼리 지원

### 5. **diary_entries** - 일기 테이블

부모가 작성하는 육아 일기를 저장하는 테이블입니다.

| 필드명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| `id` | UUID | PRIMARY KEY | 일기 고유 ID |
| `child_id` | UUID | NOT NULL, FK → children.id | 아이 ID |
| `user_id` | UUID | NOT NULL, FK → users.id | 작성자 ID |
| `date` | DATE | NOT NULL | 일기 날짜 |
| `content` | TEXT | NOT NULL | 일기 내용 |
| `photos` | TEXT[] | NULLABLE | 사진 URL 배열 |
| `videos` | TEXT[] | NULLABLE | 동영상 URL 배열 |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 작성 시간 |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 최종 수정 시간 |

**특징:**
- 복합 UNIQUE 제약조건: (child_id, date) - 하루 하나의 일기
- PostgreSQL 배열 타입을 활용한 미디어 파일 관리
- 마일스톤과 연동하여 특별한 순간 기록

### 6. **growth_records** - 성장 기록 테이블

아이의 신체 발달을 추적하는 테이블입니다.

| 필드명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| `id` | UUID | PRIMARY KEY | 성장 기록 고유 ID |
| `child_id` | UUID | NOT NULL, FK → children.id | 아이 ID |
| `user_id` | UUID | NOT NULL, FK → users.id | 기록자 ID |
| `weight` | DECIMAL(5,2) | NULLABLE | 체중 (kg) |
| `height` | DECIMAL(5,2) | NULLABLE | 신장 (cm) |
| `head_circumference` | DECIMAL(5,2) | NULLABLE | 머리둘레 (cm) |
| `recorded_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 측정 시간 |
| `notes` | TEXT | NULLABLE | 측정 메모 |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 기록 생성 시간 |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 최종 수정 시간 |

**특징:**
- 최소 하나의 측정값은 필수 (체중, 신장, 머리둘레 중 하나)
- WHO 성장 곡선과 비교를 위한 정확한 수치 기록
- 시계열 데이터로 성장 추이 분석 가능

### 7. **milestones** - 마일스톤 테이블

아이의 발달 이정표를 기록하는 테이블입니다.

| 필드명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| `id` | UUID | PRIMARY KEY | 마일스톤 고유 ID |
| `child_id` | UUID | NOT NULL, FK → children.id | 아이 ID |
| `diary_entry_id` | UUID | NULLABLE, FK → diary_entries.id | 연관된 일기 ID |
| `type` | TEXT | NOT NULL | 마일스톤 타입 |
| `title` | TEXT | NOT NULL | 마일스톤 제목 |
| `description` | TEXT | NOT NULL | 상세 설명 |
| `achieved_at` | TIMESTAMPTZ | NOT NULL | 달성 시간 |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 기록 생성 시간 |

**마일스톤 타입:**
- `first_smile`: 첫 미소
- `first_step`: 첫 걸음마
- `first_word`: 첫 말
- `first_tooth`: 첫 이가 남
- `custom`: 사용자 정의

**특징:**
- 일기와 연동하여 특별한 순간을 상세히 기록
- 시간순 정렬로 발달 과정 추적
- 사용자 정의 마일스톤으로 개인화 지원

## 🔐 인증 및 권한

### JWT 기반 인증
- Supabase Auth를 통한 사용자 인증
- JWT 토큰 기반 세션 관리
- 자동 토큰 갱신 지원

### 권한 기반 접근 제어 (RBAC)
- **Owner**: 아이 프로필 소유자, 모든 권한
- **Guardian**: 일반 보호자, 기록 작성/수정 가능
- **Viewer**: 보기 전용 사용자

### 데이터 접근 정책
- Row Level Security (RLS) 적용
- 사용자는 본인이 권한을 가진 아이의 데이터만 접근 가능
- API 레벨에서 추가 권한 검증

## 📚 API 엔드포인트

### 인증 (Authentication)
```
POST   /api/auth/signup      # 회원가입
POST   /api/auth/signin      # 로그인
POST   /api/auth/signout     # 로그아웃
GET    /api/auth/profile     # 프로필 조회
PUT    /api/auth/profile     # 프로필 수정
POST   /api/auth/children    # 아이 생성 (회원가입 2단계)
POST   /api/auth/join-child  # 기존 아이 참여 (회원가입 2단계)
```

### 아이 관리 (Children)
```
GET    /api/children         # 아이 목록 조회
POST   /api/children         # 아이 프로필 생성
GET    /api/children/:id     # 특정 아이 조회
PUT    /api/children/:id     # 아이 프로필 수정
DELETE /api/children/:id     # 아이 프로필 삭제
```

### 활동 기록 (Activities)
```
GET    /api/activities           # 활동 목록 조회
POST   /api/activities           # 활동 기록 생성
GET    /api/activities/:id       # 특정 활동 조회
PUT    /api/activities/:id       # 활동 기록 수정
DELETE /api/activities/:id       # 활동 기록 삭제
GET    /api/activities/summary/:child_id  # 활동 요약 조회
```

### 일기 (Diary)
```
GET    /api/diary               # 일기 목록 조회
POST   /api/diary               # 일기 작성
GET    /api/diary/:id           # 특정 일기 조회
PUT    /api/diary/:id           # 일기 수정
DELETE /api/diary/:id           # 일기 삭제
POST   /api/diary/milestones    # 마일스톤 추가
```

### 성장 기록 (Growth)
```
GET    /api/growth              # 성장 기록 목록 조회
POST   /api/growth              # 성장 기록 생성
GET    /api/growth/:id          # 특정 성장 기록 조회
PUT    /api/growth/:id          # 성장 기록 수정
DELETE /api/growth/:id          # 성장 기록 삭제
```

### 보호자 관리 (Guardians)
```
GET    /api/guardians/:child_id     # 보호자 목록 조회
POST   /api/guardians/invite        # 보호자 초대
PUT    /api/guardians/:id/role      # 보호자 역할 변경
DELETE /api/guardians/:id           # 보호자 제거
```

## 🧪 개발 도구

### 타입 검사
```bash
pnpm type-check     # TypeScript 타입 검사
```

### 코드 품질
```bash
pnpm lint          # ESLint 실행
pnpm lint:fix      # ESLint 자동 수정
```

### 데이터베이스
```bash
pnpm db:types      # Supabase 타입 생성
pnpm db:push       # 스키마 변경사항 배포
pnpm db:pull       # 스키마 변경사항 가져오기
```

## 🔄 케이스 변환 시스템

API는 camelCase를 사용하고 데이터베이스는 snake_case를 사용합니다. 자동 변환 시스템이 구현되어 있습니다:

```typescript
// API Request (camelCase)
{
  "childId": "uuid",
  "birthDate": "2024-01-01",
  "photoUrl": "https://..."
}

// Database Storage (snake_case)
{
  "child_id": "uuid",
  "birth_date": "2024-01-01", 
  "photo_url": "https://..."
}
```

## 📊 성능 최적화

### 데이터베이스 인덱싱
- `activities`: (child_id, type, timestamp) 복합 인덱스
- `diary_entries`: (child_id, date) 복합 UNIQUE 인덱스
- `growth_records`: (child_id, recorded_at) 복합 인덱스
- `child_guardians`: (child_id, user_id) 복합 UNIQUE 인덱스

### 쿼리 최적화
- 조인 쿼리 최소화
- JSONB 인덱싱 활용
- 페이지네이션 구현
- 조건부 필터링

## 🛡️ 보안

### 데이터 보호
- Row Level Security (RLS) 적용
- JWT 토큰 검증
- SQL 인젝션 방지 (Prepared Statements)
- CORS 설정

### 개인정보 보호
- 민감한 데이터 암호화
- 로그에서 개인정보 제외
- GDPR 준수 설계
- 아동 데이터 보호 강화

## 🚀 배포

### 환경별 설정
- **개발**: 로컬 Supabase 인스턴스
- **스테이징**: Supabase 클라우드
- **프로덕션**: Supabase 클라우드 + CDN

### CI/CD 파이프라인
- GitHub Actions 기반 자동화
- 타입 검사 및 린팅
- 자동 테스트 실행
- 무중단 배포

---

## 📞 지원

문의사항이나 버그 리포트는 프로젝트 관리자에게 연락해 주세요.

**다온(Daon) Backend** - 안전하고 확장 가능한 육아 기록 API 서비스