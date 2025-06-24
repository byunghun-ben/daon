import { useMutation, useQueryClient } from "@tanstack/react-query";
import { childrenApi } from "../index";
import { queryKeys } from "../../../constants";
import type { CreateChildRequest } from "@daon/shared";

export const useCreateChild = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateChildRequest) => childrenApi.createChild(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.children.lists() });
    },
  });
};
