import { useQuery } from "@tanstack/react-query";
import { diaryApi } from "../api";

export const useDiaryEntry = (id: string) => {
  return useQuery({
    queryKey: ["diaryEntry", id],
    queryFn: () => diaryApi.getDiaryEntry(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
