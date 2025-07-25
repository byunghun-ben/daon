import type {
  ActivityFilters,
  CreateActivityRequest,
  UpdateActivityRequest,
} from "@daon/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { activitiesApi } from "../activities";
import { createQueryKeys } from "./createCrudHooks";

// Query Keys
export const ACTIVITIES_KEYS = createQueryKeys("activities");

// Hooks
export function useActivities(params: ActivityFilters) {
  return useQuery({
    queryKey: ACTIVITIES_KEYS.list(params),
    queryFn: () => activitiesApi.getActivities(params),
    enabled: !!params.childId,
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
    mutationFn: (data: CreateActivityRequest) =>
      activitiesApi.createActivity(data),
    onSuccess: (newActivity) => {
      // 관련된 모든 활동 목록 쿼리를 무효화
      queryClient.invalidateQueries({ queryKey: ACTIVITIES_KEYS.lists() });

      // 새로 생성된 활동을 캐시에 추가
      queryClient.setQueryData(
        ACTIVITIES_KEYS.detail(newActivity.activity.id),
        { activity: newActivity.activity },
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
      queryClient.setQueryData(ACTIVITIES_KEYS.detail(id), {
        activity: updatedActivity.activity,
      });
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
export function useTodayActivities(childId: string | null) {
  const today = new Date();
  const startOfDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const endOfDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
    23,
    59,
    59,
  );

  return useQuery({
    queryKey: [
      ...ACTIVITIES_KEYS.list({ childId: childId || "", limit: 20, offset: 0 }),
      "today",
    ],
    queryFn: async () => {
      if (!childId) {
        return { activities: [], total: 0 };
      }
      const response = await activitiesApi.getActivities({
        childId,
        dateFrom: startOfDay.toISOString(),
        dateTo: endOfDay.toISOString(),
        limit: 20,
        offset: 0,
      });
      return response;
    },
    enabled: !!childId,
  });
}

// Recent activities helper
export function useRecentActivities(childId: string | null, limit = 10) {
  return useQuery({
    queryKey: [
      ...ACTIVITIES_KEYS.list({ childId: childId || "", limit, offset: 0 }),
      "recent",
    ],
    queryFn: () => {
      if (!childId) {
        return { activities: [], total: 0 };
      }
      return activitiesApi.getActivities({
        childId,
        limit,
        offset: 0,
      });
    },
    enabled: !!childId,
  });
}
