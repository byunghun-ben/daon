import { queryKeys } from "@/shared/constants/queryKeys";
import { useQuery } from "@tanstack/react-query";
import { childrenApi } from "../api";

export const useChildQuery = (id: string) => {
  return useQuery({
    queryKey: queryKeys.children.detail(id),
    queryFn: () => childrenApi.getChild(id),
    enabled: !!id,
  });
};
