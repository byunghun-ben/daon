import { useQuery } from "@tanstack/react-query";
import { growthApi } from "../api";

export const useGrowthRecord = (id: string) => {
  return useQuery({
    queryKey: ["growthRecord", id],
    queryFn: () => growthApi.getGrowthRecord(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
