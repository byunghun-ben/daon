import { useMutation, useQueryClient } from "@tanstack/react-query";
import { childrenApi } from "../index";
import { queryKeys } from "../../../constants";
import type { UpdateChildRequest } from "@daon/shared";

export const useUpdateChild = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateChildRequest }) =>
      childrenApi.updateChild(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.children.detail(id),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.children.lists() });
    },
  });
};
