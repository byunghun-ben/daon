import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../../constants";
import { childrenApi } from "../api";

export const useChildQuery = (id: string) => {
  return useQuery({
    queryKey: queryKeys.children.detail(id),
    queryFn: () => childrenApi.getChild(id),
    enabled: !!id,
  });
};
