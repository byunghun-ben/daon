import { type UpdateGrowthRecordRequest } from "@daon/shared";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { growthApi } from "../api";

export const useUpdateGrowthRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateGrowthRecordRequest;
    }) => growthApi.updateGrowthRecord(id, data),
    onSuccess: (response, { id }) => {
      // 성장 기록 목록 무효화
      queryClient.invalidateQueries({ queryKey: ["growthRecords"] });

      // 성장 차트 데이터 무효화 (아이 ID 가져오기)
      const childId = response.growthRecord.childId;
      queryClient.invalidateQueries({
        queryKey: ["growthChart", childId],
      });

      // 업데이트된 성장 기록을 캐시에 설정
      queryClient.setQueryData(["growthRecord", id], response);
    },
  });
};
