import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../../constants";
import { childrenApi } from "../api";

export const useDeleteChild = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => childrenApi.deleteChild(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.children.lists() });
    },
  });
};
