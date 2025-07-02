import { type CreateGrowthRecordRequest } from "@daon/shared";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { growthApi } from "../api";

export const useCreateGrowthRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateGrowthRecordRequest) =>
      growthApi.createGrowthRecord(data),
    onSuccess: (response, variables) => {
      // 성장 기록 목록 무효화
      queryClient.invalidateQueries({ queryKey: ["growthRecords"] });

      // 특정 아이의 성장 기록 목록 무효화
      queryClient.invalidateQueries({
        queryKey: ["growthRecords", { childId: variables.childId }],
      });

      // 성장 차트 데이터 무효화
      queryClient.invalidateQueries({
        queryKey: ["growthChart", variables.childId],
      });

      // 새로 생성된 성장 기록을 캐시에 추가
      queryClient.setQueryData(
        ["growthRecord", response.growthRecord.id],
        response,
      );
    },
  });
};
