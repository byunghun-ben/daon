import { type CreateDiaryEntryRequest } from "@daon/shared";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { diaryApi } from "../api";

export const useCreateDiaryEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDiaryEntryRequest) =>
      diaryApi.createDiaryEntry(data),
    onSuccess: (response, variables) => {
      // 일기 목록 무효화
      queryClient.invalidateQueries({ queryKey: ["diaryEntries"] });

      // 특정 아이의 일기 목록 무효화
      queryClient.invalidateQueries({
        queryKey: ["diaryEntries", { childId: variables.childId }],
      });

      // 새로 생성된 일기를 캐시에 추가
      queryClient.setQueryData(
        ["diaryEntry", response.diaryEntry.id],
        response,
      );
    },
  });
};
