import { queryKeys } from "@/shared/constants/queryKeys";
import type { UpdateChildRequest } from "@daon/shared";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { childrenApi } from "../api";

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
