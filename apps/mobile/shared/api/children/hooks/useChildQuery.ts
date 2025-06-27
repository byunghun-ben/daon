import { useQuery } from "@tanstack/react-query";
import { childrenApi } from "../index";
import { queryKeys } from "../../../constants";

export const useChildQuery = (id: string) => {
  return useQuery({
    queryKey: queryKeys.children.detail(id),
    queryFn: () => childrenApi.getChild(id),
    enabled: !!id,
  });
};
