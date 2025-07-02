import { type GrowthFilters } from "@daon/shared";
import { useQuery } from "@tanstack/react-query";
import { growthApi } from "../api";

export const useGrowthRecords = (filters?: GrowthFilters) => {
  return useQuery({
    queryKey: ["growthRecords", filters],
    queryFn: () => growthApi.getGrowthRecords(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
