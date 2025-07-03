import {
  AnalyticsRequest,
  AnalyticsResponse,
  ComparisonAnalytics,
} from "@daon/shared";
import { apiClient } from "../client";

export const analyticsApi = {
  // 종합 분석 데이터 조회
  async getAnalytics(params: AnalyticsRequest): Promise<AnalyticsResponse> {
    const response = await apiClient.post<{ analytics: AnalyticsResponse }>(
      "/analytics",
      params
    );
    return response.analytics;
  },

  // 비교 분석 데이터 조회
  async getComparisonAnalytics(
    childId: string,
    currentPeriod: AnalyticsRequest["period"],
    previousPeriod: AnalyticsRequest["period"]
  ): Promise<ComparisonAnalytics> {
    const response = await apiClient.post<{ comparison: ComparisonAnalytics }>(
      "/analytics/comparison",
      {
        childId,
        currentPeriod,
        previousPeriod,
      }
    );
    return response.comparison;
  },

  // 수유 패턴 상세 분석
  async getFeedingPatternDetails(
    childId: string,
    period: AnalyticsRequest["period"]
  ) {
    const response = await apiClient.get(
      `/analytics/${childId}/feeding`,
      {
        params: period,
      }
    );
    return response;
  },

  // 수면 패턴 상세 분석
  async getSleepPatternDetails(
    childId: string,
    period: AnalyticsRequest["period"]
  ) {
    const response = await apiClient.get(
      `/analytics/${childId}/sleep`,
      {
        params: period,
      }
    );
    return response;
  },

  // 성장 패턴 상세 분석
  async getGrowthPatternDetails(
    childId: string,
    period: AnalyticsRequest["period"]
  ) {
    const response = await apiClient.get(
      `/analytics/${childId}/growth`,
      {
        params: period,
      }
    );
    return response;
  },

  // 기저귀 패턴 상세 분석
  async getDiaperPatternDetails(
    childId: string,
    period: AnalyticsRequest["period"]
  ) {
    const response = await apiClient.get(
      `/analytics/${childId}/diaper`,
      {
        params: period,
      }
    );
    return response;
  },

  // 인사이트 조회
  async getInsights(childId: string) {
    const response = await apiClient.get(`/analytics/${childId}/insights`);
    return response;
  },
};