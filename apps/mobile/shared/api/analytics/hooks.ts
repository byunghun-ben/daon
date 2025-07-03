import type {
  AnalyticsRequest,
  AnalyticsResponse,
  ComparisonAnalytics,
} from "@daon/shared";
import type { UseQueryOptions } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "./index";

// Query Keys
export const ANALYTICS_KEYS = {
  all: ["analytics"] as const,
  lists: () => [...ANALYTICS_KEYS.all, "list"] as const,
  list: (params: AnalyticsRequest) =>
    [...ANALYTICS_KEYS.lists(), params] as const,
  comparisons: () => [...ANALYTICS_KEYS.all, "comparison"] as const,
  comparison: (
    childId: string,
    currentPeriod: string,
    previousPeriod: string
  ) =>
    [
      ...ANALYTICS_KEYS.comparisons(),
      childId,
      currentPeriod,
      previousPeriod,
    ] as const,
};

// Analytics 데이터 조회 훅
export function useAnalytics(
  params: AnalyticsRequest,
  options?: Omit<UseQueryOptions<AnalyticsResponse>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: ANALYTICS_KEYS.list(params),
    queryFn: () => analyticsApi.getAnalytics(params),
    enabled: !!params.childId,
    staleTime: 5 * 60 * 1000, // 5분간 신선한 데이터로 간주
    gcTime: 10 * 60 * 1000, // 10분간 캐시 보관
    ...options,
  });
}

// 비교 분석 데이터 조회 훅
export function useComparisonAnalytics(
  childId: string,
  currentPeriod: AnalyticsRequest["period"],
  previousPeriod: AnalyticsRequest["period"],
  options?: Omit<UseQueryOptions<ComparisonAnalytics>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: ANALYTICS_KEYS.comparison(
      childId,
      `${currentPeriod.startDate}-${currentPeriod.endDate}`,
      `${previousPeriod.startDate}-${previousPeriod.endDate}`
    ),
    queryFn: () =>
      analyticsApi.getComparisonAnalytics(
        childId,
        currentPeriod,
        previousPeriod
      ),
    enabled: !!childId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    ...options,
  });
}

// 수유 패턴 분석만 조회하는 훅
export function useFeedingAnalytics(
  params: Omit<AnalyticsRequest, "includePatterns">,
  options?: Omit<UseQueryOptions<AnalyticsResponse>, "queryKey" | "queryFn">
) {
  const analyticsParams: AnalyticsRequest = {
    ...params,
    includePatterns: ["feeding"],
  };

  return useAnalytics(analyticsParams, options);
}

// 수면 패턴 분석만 조회하는 훅
export function useSleepAnalytics(
  params: Omit<AnalyticsRequest, "includePatterns">,
  options?: Omit<UseQueryOptions<AnalyticsResponse>, "queryKey" | "queryFn">
) {
  const analyticsParams: AnalyticsRequest = {
    ...params,
    includePatterns: ["sleep"],
  };

  return useAnalytics(analyticsParams, options);
}

// 성장 패턴 분석만 조회하는 훅
export function useGrowthAnalytics(
  params: Omit<AnalyticsRequest, "includePatterns">,
  options?: Omit<UseQueryOptions<AnalyticsResponse>, "queryKey" | "queryFn">
) {
  const analyticsParams: AnalyticsRequest = {
    ...params,
    includePatterns: ["growth"],
  };

  return useAnalytics(analyticsParams, options);
}

// 기저귀 패턴 분석만 조회하는 훅
export function useDiaperAnalytics(
  params: Omit<AnalyticsRequest, "includePatterns">,
  options?: Omit<UseQueryOptions<AnalyticsResponse>, "queryKey" | "queryFn">
) {
  const analyticsParams: AnalyticsRequest = {
    ...params,
    includePatterns: ["diaper"],
  };

  return useAnalytics(analyticsParams, options);
}
