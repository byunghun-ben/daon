import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  UserSubscription,
  SubscriptionPlan,
  PremiumFeature,
  SubscriptionUsage,
  PREMIUM_FEATURES,
  SUBSCRIPTION_PLANS,
  FREE_PLAN_LIMITS,
} from "@daon/shared";

interface SubscriptionState {
  subscription: UserSubscription | null;
  plan: SubscriptionPlan | null;
  features: PremiumFeature[];
  usage: SubscriptionUsage[];
  isLoading: boolean;
  lastUpdated: string | null;
}

interface SubscriptionActions {
  setSubscription: (subscription: UserSubscription | null) => void;
  setPlan: (plan: SubscriptionPlan | null) => void;
  setFeatures: (features: PremiumFeature[]) => void;
  setUsage: (usage: SubscriptionUsage[]) => void;
  setLoading: (loading: boolean) => void;
  updateUsage: (feature: string, usage: number) => void;
  clearSubscription: () => void;
  
  // Helper methods
  hasFeature: (featureKey: string) => boolean;
  canUseFeature: (featureKey: string, requestedUsage?: number) => boolean;
  getRemainingUsage: (featureKey: string) => number | null;
  isTrialActive: () => boolean;
  getTrialDaysRemaining: () => number | null;
  isPremium: () => boolean;
  isActive: () => boolean;
}

export type SubscriptionStore = SubscriptionState & SubscriptionActions;

const getInitialState = (): SubscriptionState => ({
  subscription: null,
  plan: null,
  features: [],
  usage: [],
  isLoading: false,
  lastUpdated: null,
});

export const useSubscriptionStore = create<SubscriptionStore>()(
  persist(
    (set, get) => ({
      ...getInitialState(),

      // Setters
      setSubscription: (subscription) => {
        set({
          subscription,
          lastUpdated: new Date().toISOString(),
        });
      },

      setPlan: (plan) => {
        set({
          plan,
          lastUpdated: new Date().toISOString(),
        });
      },

      setFeatures: (features) => {
        set({
          features,
          lastUpdated: new Date().toISOString(),
        });
      },

      setUsage: (usage) => {
        set({
          usage,
          lastUpdated: new Date().toISOString(),
        });
      },

      setLoading: (isLoading) => {
        set({ isLoading });
      },

      updateUsage: (feature, usage) => {
        const currentUsage = get().usage;
        const existingIndex = currentUsage.findIndex(u => u.feature === feature);
        
        if (existingIndex >= 0) {
          const updatedUsage = [...currentUsage];
          updatedUsage[existingIndex] = {
            ...updatedUsage[existingIndex],
            usage,
            updatedAt: new Date().toISOString(),
          };
          set({
            usage: updatedUsage,
            lastUpdated: new Date().toISOString(),
          });
        }
      },

      clearSubscription: () => {
        set(getInitialState());
      },

      // Helper methods
      hasFeature: (featureKey) => {
        const { plan, features } = get();
        if (!plan) return false;

        // Check if feature is available in current plan
        const feature = features.find(f => f.key === featureKey);
        if (!feature) return false;

        // Check plan requirements
        if (feature.requiredPlan === SUBSCRIPTION_PLANS.FREE) return true;
        if (feature.requiredPlan === SUBSCRIPTION_PLANS.PREMIUM && 
            (plan.name === SUBSCRIPTION_PLANS.PREMIUM || plan.name === SUBSCRIPTION_PLANS.FAMILY)) {
          return true;
        }
        if (feature.requiredPlan === SUBSCRIPTION_PLANS.FAMILY && 
            plan.name === SUBSCRIPTION_PLANS.FAMILY) {
          return true;
        }

        return false;
      },

      canUseFeature: (featureKey, requestedUsage = 1) => {
        const { hasFeature, getRemainingUsage, isActive } = get();
        
        // Must have active subscription
        if (!isActive()) return false;
        
        // Must have feature access
        if (!hasFeature(featureKey)) return false;

        // Check usage limits
        const remaining = getRemainingUsage(featureKey);
        if (remaining === null) return true; // No limit
        
        return remaining >= requestedUsage;
      },

      getRemainingUsage: (featureKey) => {
        const { features, usage, plan } = get();
        
        const feature = features.find(f => f.key === featureKey);
        if (!feature || feature.usageLimit === null) return null; // No limit

        const currentUsage = usage.find(u => u.feature === featureKey)?.usage || 0;
        
        // Get effective limit based on plan
        let effectiveLimit = feature.usageLimit;
        
        // Apply free plan limits
        if (plan?.name === SUBSCRIPTION_PLANS.FREE) {
          switch (featureKey) {
            case PREMIUM_FEATURES.UNLIMITED_CHILDREN:
              effectiveLimit = FREE_PLAN_LIMITS.CHILDREN;
              break;
            case PREMIUM_FEATURES.UNLIMITED_PHOTOS:
              effectiveLimit = FREE_PLAN_LIMITS.PHOTOS_PER_MONTH;
              break;
            case PREMIUM_FEATURES.MULTIPLE_CAREGIVERS:
              effectiveLimit = FREE_PLAN_LIMITS.CAREGIVERS;
              break;
            case PREMIUM_FEATURES.DATA_EXPORT:
              effectiveLimit = FREE_PLAN_LIMITS.EXPORT_PER_MONTH;
              break;
          }
        }

        return Math.max(0, effectiveLimit - currentUsage);
      },

      isTrialActive: () => {
        const { subscription } = get();
        if (!subscription || subscription.status !== "trialing") return false;
        
        const now = new Date();
        const trialEnd = subscription.trialEnd ? new Date(subscription.trialEnd) : null;
        
        return trialEnd ? now < trialEnd : false;
      },

      getTrialDaysRemaining: () => {
        const { subscription, isTrialActive } = get();
        if (!isTrialActive() || !subscription?.trialEnd) return null;

        const now = new Date();
        const trialEnd = new Date(subscription.trialEnd);
        const diffTime = trialEnd.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return Math.max(0, diffDays);
      },

      isPremium: () => {
        const { plan } = get();
        return plan?.name === SUBSCRIPTION_PLANS.PREMIUM || 
               plan?.name === SUBSCRIPTION_PLANS.FAMILY;
      },

      isActive: () => {
        const { subscription } = get();
        return subscription?.status === "active" || subscription?.status === "trialing";
      },
    }),
    {
      name: "subscription-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        subscription: state.subscription,
        plan: state.plan,
        features: state.features,
        usage: state.usage,
        lastUpdated: state.lastUpdated,
      }),
    }
  )
);

// Subscription helper hooks
export const useIsPremium = () => useSubscriptionStore(state => state.isPremium());
export const useIsActive = () => useSubscriptionStore(state => state.isActive());
export const useHasFeature = (featureKey: string) => 
  useSubscriptionStore(state => state.hasFeature(featureKey));
export const useCanUseFeature = (featureKey: string, requestedUsage?: number) => 
  useSubscriptionStore(state => state.canUseFeature(featureKey, requestedUsage));
export const useRemainingUsage = (featureKey: string) => 
  useSubscriptionStore(state => state.getRemainingUsage(featureKey));