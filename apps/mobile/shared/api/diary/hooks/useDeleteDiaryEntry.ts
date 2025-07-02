import { useMutation, useQueryClient } from "@tanstack/react-query";
import { diaryApi } from "../api";

export const useDeleteDiaryEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => diaryApi.deleteDiaryEntry(id),
    onSuccess: (_, id) => {
      // 일기 목록 무효화
      queryClient.invalidateQueries({ queryKey: ["diaryEntries"] });

      // 삭제된 일기를 캐시에서 제거
      queryClient.removeQueries({ queryKey: ["diaryEntry", id] });
    },
  });
};
