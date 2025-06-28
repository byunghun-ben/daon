import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../../constants";
import { childrenApi } from "../api";

export const useChildrenQuery = () => {
  return useQuery({
    queryKey: queryKeys.children.lists(),
    queryFn: () => childrenApi.getChildren(),
  });
};
