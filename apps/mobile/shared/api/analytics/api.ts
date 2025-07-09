import type { AnalyticsRequest } from "@daon/shared";

export const analyticsApi = {
  getAnalytics: async (params: AnalyticsRequest) => {
    const response = await fetch("/api/analytics", {
      method: "GET",
      body: JSON.stringify(params),
    });
    return response.json();
  },
  getComparisonAnalytics: async (
    childId: string,
    currentPeriod: AnalyticsRequest["period"],
    previousPeriod: AnalyticsRequest["period"],
  ) => {
    const response = await fetch("/api/analytics/comparison", {
      method: "GET",
      body: JSON.stringify({ childId, currentPeriod, previousPeriod }),
    });
    return response.json();
  },
};
