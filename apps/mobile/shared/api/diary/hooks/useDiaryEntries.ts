import { type DiaryFilters } from "@daon/shared";
import { useQuery } from "@tanstack/react-query";
import { diaryApi } from "../api";

export const useDiaryEntries = (filters?: DiaryFilters) => {
  return useQuery({
    queryKey: ["diaryEntries", filters],
    queryFn: () => diaryApi.getDiaryEntries(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
