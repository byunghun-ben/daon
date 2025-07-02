import { type UpdateDiaryEntryRequest } from "@daon/shared";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { diaryApi } from "../api";

export const useUpdateDiaryEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDiaryEntryRequest }) =>
      diaryApi.updateDiaryEntry(id, data),
    onSuccess: (response, { id }) => {
      // 일기 목록 무효화
      queryClient.invalidateQueries({ queryKey: ["diaryEntries"] });

      // 업데이트된 일기를 캐시에 설정
      queryClient.setQueryData(["diaryEntry", id], response);
    },
  });
};
