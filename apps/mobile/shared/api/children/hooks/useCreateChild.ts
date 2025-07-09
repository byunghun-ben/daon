import { queryKeys } from "@/shared/constants/queryKeys";
import type { CreateChildRequest } from "@daon/shared";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { childrenApi } from "../api";

export const useCreateChild = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateChildRequest) => childrenApi.createChild(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.children.lists() });
    },
  });
};
