import { useAuthStore } from "../../store";

interface OnboardingState {
  needsChildRegistration: boolean;
  isLoading: boolean;
}

export const useOnboarding = () => {
  const { user } = useAuthStore();

  const onboardingState: OnboardingState = {
    needsChildRegistration: user?.registrationStatus === "incomplete",
    isLoading: false,
  };

  return {
    ...onboardingState,
  };
};
