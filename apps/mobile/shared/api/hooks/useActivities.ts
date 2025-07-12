import type {
  ActivityFilters,
  CreateActivityRequest,
  UpdateActivityRequest,
} from "@daon/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { activitiesApi } from "../activities";
import { createQueryKeys } from "./createCrudHooks";
import { useActiveChildStore } from "../../store/activeChildStore";

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
  const setActiveChild = useActiveChildStore((state) => state.setActiveChild);

  return useMutation({
    mutationFn: (data: CreateActivityRequest) =>
      activitiesApi.createActivity(data),
    onSuccess: (newActivity, data) => {
      // 관련된 모든 활동 목록 쿼리를 무효화
      queryClient.invalidateQueries({ queryKey: ACTIVITIES_KEYS.lists() });

      // 새로 생성된 활동을 캐시에 추가
      queryClient.setQueryData(
        ACTIVITIES_KEYS.detail(newActivity.activity.id),
        { activity: newActivity.activity },
      );

      // 방금 기록한 아이를 activeChild로 설정
      if (data.childId) {
        setActiveChild(data.childId);
      }
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
  // childId 유무에 따라 필터 객체 구성
  const filters: ActivityFilters = {
    limit,
    offset: 0,
    ...(childId && { childId }),
  };

  return useQuery({
    queryKey: [...ACTIVITIES_KEYS.list(filters), "recent"],
    queryFn: () => activitiesApi.getActivities(filters),
    enabled: true, // childId가 없어도 실행
  });
}
