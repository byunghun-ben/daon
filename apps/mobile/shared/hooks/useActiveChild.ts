import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  useActiveChildStore,
  getActiveChildId,
} from "../store/activeChildStore";
import { childrenApi } from "../api/children";

export const useActiveChild = () => {
  const queryClient = useQueryClient();

  const {
    activeChildId,
    activeChild,
    availableChildren,
    setActiveChild,
    setAvailableChildren,
    initializeActiveChild,
  } = useActiveChildStore();

  // 아이 목록 가져오기
  const {
    data: childrenData,
    isLoading: isLoadingChildren,
    error: childrenError,
    refetch: refetchChildren,
  } = useQuery({
    queryKey: ["children"],
    queryFn: childrenApi.getChildren,
    staleTime: 5 * 60 * 1000, // 5분
  });

  // 아이 목록이 업데이트되면 스토어에 반영
  useEffect(() => {
    if (childrenData?.children) {
      setAvailableChildren(childrenData.children);
    }
  }, [childrenData?.children, setAvailableChildren]);

  // 초기화: 저장된 activeChildId로 복원 또는 첫 번째 아이 선택
  useEffect(() => {
    if (availableChildren.length > 0 && !activeChild) {
      initializeActiveChild();
    }
  }, [availableChildren, activeChild, initializeActiveChild]);

  // 아이 전환 함수
  const switchChild = (childId: string) => {
    setActiveChild(childId);

    // 아이가 변경되면 관련된 모든 쿼리 무효화
    queryClient.invalidateQueries({
      predicate: (query) => {
        const queryKey = query.queryKey;
        // activities, diary, growth 등 아이별 데이터 쿼리들 무효화
        return (
          queryKey.includes("activities") ||
          queryKey.includes("diary") ||
          queryKey.includes("growth") ||
          queryKey.includes("activity-summary")
        );
      },
    });
  };

  // 현재 선택된 아이의 상세 정보 가져오기 (필요시)
  const { data: activeChildDetails, isLoading: isLoadingActiveChild } =
    useQuery({
      queryKey: ["child", activeChildId],
      queryFn: () =>
        activeChildId ? childrenApi.getChild(activeChildId) : null,
      enabled: !!activeChildId,
      staleTime: 10 * 60 * 1000, // 10분
    });

  return {
    // 상태
    activeChildId,
    activeChild: activeChildDetails?.child || activeChild,
    availableChildren,
    hasMultipleChildren: availableChildren.length > 1,

    // 로딩 상태
    isLoadingChildren,
    isLoadingActiveChild,
    isLoading: isLoadingChildren || isLoadingActiveChild,

    // 에러
    error: childrenError,

    // 액션
    switchChild,
    refetchChildren,
  };
};

// activeChildId를 쿼리 키에 포함하는 헬퍼 함수
export const createChildQueryKey = (
  baseKey: string[],
  childId?: string | null,
) => {
  const targetChildId = childId || getActiveChildId();
  return targetChildId ? [...baseKey, targetChildId] : baseKey;
};

// 활성 아이 기준 쿼리 키 생성 헬퍼들
export const getActivitiesQueryKey = (filters?: any) =>
  createChildQueryKey(["activities"], getActiveChildId()).concat(
    filters ? [filters] : [],
  );

export const getActivitySummaryQueryKey = (date?: string) =>
  createChildQueryKey(["activity-summary"], getActiveChildId()).concat(
    date ? [date] : [],
  );

export const getDiaryQueryKey = (filters?: any) =>
  createChildQueryKey(["diary"], getActiveChildId()).concat(
    filters ? [filters] : [],
  );

export const getGrowthQueryKey = (filters?: any) =>
  createChildQueryKey(["growth"], getActiveChildId()).concat(
    filters ? [filters] : [],
  );
