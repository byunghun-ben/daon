import { useQuery } from "@tanstack/react-query";
import { growthApi } from "../api";

export const useGrowthChart = (childId: string) => {
  return useQuery({
    queryKey: ["growthChart", childId],
    queryFn: () => growthApi.getGrowthChart(childId),
    enabled: !!childId,
    staleTime: 10 * 60 * 1000, // 10 minutes (차트 데이터는 좀 더 오래 캐시)
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};
