import { queryKeys } from "@/shared/constants/queryKeys";
import { useQuery } from "@tanstack/react-query";
import { childrenApi } from "../api";

export const useChildrenQuery = () => {
  return useQuery({
    queryKey: queryKeys.children.lists(),
    queryFn: () => childrenApi.getChildren(),
  });
};
