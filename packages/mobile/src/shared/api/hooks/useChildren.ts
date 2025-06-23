import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { childrenApi } from "../children";
import {
  ChildApi,
  CreateChildRequest,
  UpdateChildRequest,
  JoinChildRequest,
} from "@daon/shared";

// Query Keys
export const CHILDREN_KEYS = {
  all: ["children"] as const,
  lists: () => [...CHILDREN_KEYS.all, "list"] as const,
  list: () => [...CHILDREN_KEYS.lists()] as const,
  details: () => [...CHILDREN_KEYS.all, "detail"] as const,
  detail: (id: string) => [...CHILDREN_KEYS.details(), id] as const,
};

// Hooks
export function useChildren() {
  return useQuery({
    queryKey: CHILDREN_KEYS.list(),
    queryFn: () => childrenApi.getChildren(),
  });
}

export function useChild(id: string) {
  return useQuery({
    queryKey: CHILDREN_KEYS.detail(id),
    queryFn: () => childrenApi.getChild(id),
    enabled: !!id,
  });
}

export function useCreateChild() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateChildRequest) => childrenApi.createChild(data),
    onSuccess: (newChild) => {
      // 아이 목록 쿼리를 무효화
      queryClient.invalidateQueries({ queryKey: CHILDREN_KEYS.lists() });

      // 새로 생성된 아이를 캐시에 추가
      queryClient.setQueryData(CHILDREN_KEYS.detail(newChild.child.id), {
        child: newChild.child,
      });
    },
  });
}

export function useUpdateChild() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateChildRequest }) =>
      childrenApi.updateChild(id, data),
    onSuccess: (updatedChild, { id }) => {
      // 아이 목록 쿼리를 무효화
      queryClient.invalidateQueries({ queryKey: CHILDREN_KEYS.lists() });

      // 업데이트된 아이를 캐시에 반영
      queryClient.setQueryData(CHILDREN_KEYS.detail(id), {
        child: updatedChild.child,
      });
    },
  });
}

export function useDeleteChild() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => childrenApi.deleteChild(id),
    onSuccess: (_, id) => {
      // 아이 목록 쿼리를 무효화
      queryClient.invalidateQueries({ queryKey: CHILDREN_KEYS.lists() });

      // 삭제된 아이를 캐시에서 제거
      queryClient.removeQueries({ queryKey: CHILDREN_KEYS.detail(id) });
    },
  });
}

export function useJoinChild() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: JoinChildRequest) => childrenApi.joinChild(data),
    onSuccess: () => {
      // 아이 목록 쿼리를 무효화하여 새로 참여한 아이가 표시되도록 함
      queryClient.invalidateQueries({ queryKey: CHILDREN_KEYS.lists() });
    },
  });
}
