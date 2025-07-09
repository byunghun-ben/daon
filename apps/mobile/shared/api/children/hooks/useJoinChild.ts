import { queryKeys } from "@/shared/constants/queryKeys";
import type { JoinChildRequest } from "@daon/shared";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { childrenApi } from "../api";

export const useJoinChild = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: JoinChildRequest) => childrenApi.joinChild(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.children.lists() });
    },
  });
};
