// 앱 상수
export const APP_CONFIG = {
  NAME: "Daon",
  VERSION: "1.0.0",
  API_VERSION: "v1",
} as const;

// 활동 타입 상수 (데이터베이스 저장용)
export const ACTIVITY_TYPES = {
  FEEDING: "feeding",
  DIAPER: "diaper",
  SLEEP: "sleep",
  TUMMY_TIME: "tummy_time",
  CUSTOM: "custom",
} as const;

// 수유 타입 상수
export const FEEDING_TYPES = {
  BREAST: "breast",
  BOTTLE: "bottle",
  SOLID: "solid",
} as const;

// 기저귀 타입 상수
export const DIAPER_TYPES = {
  WET: "wet",
  DIRTY: "dirty",
  BOTH: "both",
} as const;

// 수면 품질 상수
export const SLEEP_QUALITIES = {
  GOOD: "good",
  FAIR: "fair",
  POOR: "poor",
} as const;

// 성별 상수
export const GENDERS = {
  MALE: "male",
  FEMALE: "female",
} as const;

// 보호자 역할 상수
export const GUARDIAN_ROLES = {
  OWNER: "owner",
  GUARDIAN: "guardian",
  VIEWER: "viewer",
} as const;

// 마일스톤 타입 상수
export const MILESTONE_TYPES = {
  FIRST_SMILE: "first_smile",
  FIRST_STEP: "first_step",
  FIRST_WORD: "first_word",
  CUSTOM: "custom",
} as const;

// 활동 타입별 색상
export const ACTIVITY_COLORS = {
  FEEDING: "#4CAF50",
  DIAPER: "#FF9800",
  SLEEP: "#2196F3",
  TUMMY_TIME: "#9C27B0",
  CUSTOM: "#757575",
} as const;

// 활동 타입별 한글명
export const ACTIVITY_LABELS = {
  FEEDING: "수유",
  DIAPER: "기저귀",
  SLEEP: "수면",
  TUMMY_TIME: "배밀이",
  CUSTOM: "기타",
} as const;

// 수유 타입 한글명
export const FEEDING_TYPE_LABELS = {
  BREAST: "모유",
  BOTTLE: "분유",
  SOLID: "이유식",
} as const;

// 기저귀 타입 한글명
export const DIAPER_TYPE_LABELS = {
  WET: "소변",
  DIRTY: "대변",
  BOTH: "소변+대변",
} as const;

// 수면 품질 한글명
export const SLEEP_QUALITY_LABELS = {
  GOOD: "좋음",
  FAIR: "보통",
  POOR: "나쁨",
} as const;

// 마일스톤 타입 한글명
export const MILESTONE_TYPE_LABELS = {
  FIRST_SMILE: "첫 미소",
  FIRST_STEP: "첫 걸음마",
  FIRST_WORD: "첫 말",
  SITTING_UP: "앉기",
  CRAWLING: "기어다니기",
  WALKING: "걷기",
  TALKING: "말하기",
  CUSTOM: "기타",
} as const;

// 권한 레벨
export const PERMISSION_LABELS = {
  ADMIN: "관리자",
  VIEW_ONLY: "보기 전용",
} as const;

// 날짜 형식
export const DATE_FORMATS = {
  DISPLAY: "YYYY년 MM월 DD일",
  API: "YYYY-MM-DD",
  DATETIME: "YYYY-MM-DD HH:mm:ss",
  TIME: "HH:mm",
} as const;

// 파일 업로드 제한
export const FILE_LIMITS = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/webp"],
  ALLOWED_VIDEO_TYPES: ["video/mp4", "video/quicktime"],
} as const;

// API 엔드포인트
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    REFRESH: "/auth/refresh",
    LOGOUT: "/auth/logout",
  },
  CHILDREN: "/children",
  ACTIVITIES: "/activities",
  DIARY: "/diary",
  GROWTH: "/growth",
  GUARDIANS: "/guardians",
  DASHBOARD: "/dashboard",
} as const;
