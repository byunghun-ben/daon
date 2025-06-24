import { useMutation, useQueryClient } from "@tanstack/react-query";
import { childrenApi } from "../index";
import { queryKeys } from "../../../constants";
import type { JoinChildRequest } from "@daon/shared";

export const useJoinChild = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: JoinChildRequest) => childrenApi.joinChild(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.children.lists() });
    },
  });
};
