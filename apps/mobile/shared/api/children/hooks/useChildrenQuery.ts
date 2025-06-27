import { useQuery } from "@tanstack/react-query";
import { childrenApi } from "../index";
import { queryKeys } from "../../../constants";

export const useChildrenQuery = () => {
  return useQuery({
    queryKey: queryKeys.children.lists(),
    queryFn: () => childrenApi.getChildren(),
  });
};
