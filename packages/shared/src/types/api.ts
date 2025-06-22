// API 공통 타입
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

// API 에러 타입
export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

// 필터링 및 정렬
export interface ActivityFilters {
  childId?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
  userId?: string;
}

export interface DiaryFilters {
  childId?: string;
  startDate?: string;
  endDate?: string;
  userId?: string;
}

export interface GrowthFilters {
  childId?: string;
  startDate?: string;
  endDate?: string;
}

export interface SortOptions {
  field: string;
  order: "asc" | "desc";
}

// 대시보드 데이터
export interface DashboardData {
  todayStats: {
    feedingCount: number;
    diaperCount: number;
    sleepDuration: number; // minutes
    lastActivity?: {
      type: string;
      timestamp: string;
    };
  };
  recentActivities: Array<{
    id: string;
    type: string;
    timestamp: string;
    summary: string;
  }>;
  upcomingReminders: Array<{
    id: string;
    type: string;
    message: string;
    scheduledFor: string;
  }>;
}
