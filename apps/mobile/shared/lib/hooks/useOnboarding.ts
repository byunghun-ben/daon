import { useChildrenQuery } from "../../api/children";

interface OnboardingState {
  needsChildRegistration: boolean;
  isLoading: boolean;
}

export const useOnboarding = () => {
  // 아이 목록 조회
  const { data: children, isLoading: isChildrenLoading } = useChildrenQuery();

  const onboardingState: OnboardingState = {
    needsChildRegistration:
      !isChildrenLoading && (!children || children.children.length === 0),
    isLoading: isChildrenLoading,
  };

  return {
    ...onboardingState,
  };
};
