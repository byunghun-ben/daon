import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { activitiesApi, type Activity, type CreateActivityRequest, type UpdateActivityRequest, type GetActivitiesRequest } from "../activities";

// Query Keys
export const ACTIVITIES_KEYS = {
  all: ["activities"] as const,
  lists: () => [...ACTIVITIES_KEYS.all, "list"] as const,
  list: (filters: GetActivitiesRequest) => [...ACTIVITIES_KEYS.lists(), filters] as const,
  details: () => [...ACTIVITIES_KEYS.all, "detail"] as const,
  detail: (id: string) => [...ACTIVITIES_KEYS.details(), id] as const,
};

// Hooks
export function useActivities(params: GetActivitiesRequest) {
  return useQuery({
    queryKey: ACTIVITIES_KEYS.list(params),
    queryFn: () => activitiesApi.getActivities(params),
    enabled: !!params.child_id,
  });
}

export function useActivity(id: string) {
  return useQuery({
    queryKey: ACTIVITIES_KEYS.detail(id),
    queryFn: () => activitiesApi.getActivity(id),
    enabled: !!id,
  });
}

export function useCreateActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateActivityRequest) => activitiesApi.createActivity(data),
    onSuccess: (newActivity) => {
      // 관련된 모든 활동 목록 쿼리를 무효화
      queryClient.invalidateQueries({ queryKey: ACTIVITIES_KEYS.lists() });
      
      // 새로 생성된 활동을 캐시에 추가
      queryClient.setQueryData(
        ACTIVITIES_KEYS.detail(newActivity.activity.id),
        { activity: newActivity.activity }
      );
    },
  });
}

export function useUpdateActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateActivityRequest }) =>
      activitiesApi.updateActivity(id, data),
    onSuccess: (updatedActivity, { id }) => {
      // 관련된 모든 활동 목록 쿼리를 무효화
      queryClient.invalidateQueries({ queryKey: ACTIVITIES_KEYS.lists() });
      
      // 업데이트된 활동을 캐시에 반영
      queryClient.setQueryData(
        ACTIVITIES_KEYS.detail(id),
        { activity: updatedActivity.activity }
      );
    },
  });
}

export function useDeleteActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => activitiesApi.deleteActivity(id),
    onSuccess: (_, id) => {
      // 관련된 모든 활동 목록 쿼리를 무효화
      queryClient.invalidateQueries({ queryKey: ACTIVITIES_KEYS.lists() });
      
      // 삭제된 활동을 캐시에서 제거
      queryClient.removeQueries({ queryKey: ACTIVITIES_KEYS.detail(id) });
    },
  });
}

// Today's activities helper
export function useTodayActivities(childId: string) {
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

  return useQuery({
    queryKey: [...ACTIVITIES_KEYS.list({ child_id: childId }), "today"],
    queryFn: async () => {
      const response = await activitiesApi.getActivities({
        child_id: childId,
        start_date: startOfDay.toISOString(),
        end_date: endOfDay.toISOString(),
      });
      return response;
    },
    enabled: !!childId,
  });
}

// Recent activities helper
export function useRecentActivities(childId: string, limit = 10) {
  return useQuery({
    queryKey: [...ACTIVITIES_KEYS.list({ child_id: childId, limit }), "recent"],
    queryFn: () => activitiesApi.getActivities({
      child_id: childId,
      limit,
    }),
    enabled: !!childId,
  });
}