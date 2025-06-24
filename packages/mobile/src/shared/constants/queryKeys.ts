/**
 * 전체 앱의 TanStack Query 키 관리
 * 일관성 있는 네이밍과 중앙화된 키 관리를 위한 파일
 */

export const queryKeys = {
  // Children 관련 쿼리 키
  children: {
    all: ["children"] as const,
    lists: () => [...queryKeys.children.all, "list"] as const,
    list: (filters: Record<string, any>) =>
      [...queryKeys.children.lists(), { filters }] as const,
    details: () => [...queryKeys.children.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.children.details(), id] as const,
  },

  // Activities 관련 쿼리 키
  activities: {
    all: ["activities"] as const,
    lists: () => [...queryKeys.activities.all, "list"] as const,
    list: (filters: Record<string, any>) =>
      [...queryKeys.activities.lists(), { filters }] as const,
    details: () => [...queryKeys.activities.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.activities.details(), id] as const,
    byChild: (childId: string) =>
      [...queryKeys.activities.all, "child", childId] as const,
  },

  // Diary 관련 쿼리 키
  diary: {
    all: ["diary"] as const,
    lists: () => [...queryKeys.diary.all, "list"] as const,
    list: (filters: Record<string, any>) =>
      [...queryKeys.diary.lists(), { filters }] as const,
    details: () => [...queryKeys.diary.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.diary.details(), id] as const,
    byChild: (childId: string) =>
      [...queryKeys.diary.all, "child", childId] as const,
  },

  // Growth 관련 쿼리 키
  growth: {
    all: ["growth"] as const,
    lists: () => [...queryKeys.growth.all, "list"] as const,
    list: (filters: Record<string, any>) =>
      [...queryKeys.growth.lists(), { filters }] as const,
    details: () => [...queryKeys.growth.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.growth.details(), id] as const,
    byChild: (childId: string) =>
      [...queryKeys.growth.all, "child", childId] as const,
  },

  // Auth 관련 쿼리 키 (필요시)
  auth: {
    all: ["auth"] as const,
    user: () => [...queryKeys.auth.all, "user"] as const,
    profile: () => [...queryKeys.auth.all, "profile"] as const,
  },
} as const;
