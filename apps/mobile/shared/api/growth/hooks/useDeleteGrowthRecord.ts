import { useMutation, useQueryClient } from "@tanstack/react-query";
import { growthApi } from "../api";

export const useDeleteGrowthRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => growthApi.deleteGrowthRecord(id),
    onSuccess: (_, id) => {
      // 성장 기록 목록 무효화
      queryClient.invalidateQueries({ queryKey: ["growthRecords"] });

      // 성장 차트 데이터 무효화 (모든 차트)
      queryClient.invalidateQueries({ queryKey: ["growthChart"] });

      // 삭제된 성장 기록을 캐시에서 제거
      queryClient.removeQueries({ queryKey: ["growthRecord", id] });
    },
  });
};
