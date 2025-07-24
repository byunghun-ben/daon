import type {
  ActivityFilters,
  CreateActivityRequest,
  UpdateActivityRequest,
} from "@daon/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useActiveChildStore } from "../../store/activeChildStore";
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
    select: (data) => data.activities,
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

// Calendar activities helper - 월별 모든 아이들의 활동 조회
export function useCalendarActivities(dateFrom: string, dateTo: string) {
  const filters: ActivityFilters = {
    dateFrom,
    dateTo,
    limit: 1000, // 한 달 치 데이터이므로 충분한 limit 설정
    offset: 0,
    // childId를 지정하지 않아서 모든 아이들의 활동을 가져옴
  };

  return useQuery({
    queryKey: [...ACTIVITIES_KEYS.list(filters), "calendar"],
    queryFn: () => activitiesApi.getActivities(filters),
    select: (data) => data.activities,
    staleTime: 5 * 60 * 1000, // 5분간 캐시 유지
    gcTime: 30 * 60 * 1000, // 30분간 가비지 컬렉션 방지
  });
}
