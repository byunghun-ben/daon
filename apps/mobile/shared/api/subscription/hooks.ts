import type {
  CancelSubscriptionRequest,
  CreateSubscriptionRequest,
  UpdateSubscriptionRequest,
  VerifyPurchaseRequest,
} from "@daon/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React from "react";
import { useSubscriptionStore } from "../../store/subscription.store";
import { subscriptionApi } from "./api";

// Query Keys
export const SUBSCRIPTION_KEYS = {
  all: ["subscription"] as const,
  plans: () => [...SUBSCRIPTION_KEYS.all, "plans"] as const,
  status: () => [...SUBSCRIPTION_KEYS.all, "status"] as const,
  history: () => [...SUBSCRIPTION_KEYS.all, "history"] as const,
  usage: () => [...SUBSCRIPTION_KEYS.all, "usage"] as const,
  offers: () => [...SUBSCRIPTION_KEYS.all, "offers"] as const,
};

// Get subscription plans
export function useSubscriptionPlans() {
  return useQuery({
    queryKey: SUBSCRIPTION_KEYS.plans(),
    queryFn: subscriptionApi.getPlans,
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });
}

// Get subscription status
export function useSubscriptionStatus() {
  const { setSubscription, setPlan, setFeatures, setUsage } =
    useSubscriptionStore();

  const query = useQuery({
    queryKey: SUBSCRIPTION_KEYS.status(),
    queryFn: subscriptionApi.getStatus,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });

  // Update store when data changes
  React.useEffect(() => {
    if (query.data) {
      setSubscription(query.data.subscription);
      setPlan(query.data.plan);
      setFeatures(query.data.features);
      setUsage(query.data.usage);
    }
  }, [query.data, setSubscription, setPlan, setFeatures, setUsage]);

  return query;
}

// Get subscription history
export function useSubscriptionHistory() {
  return useQuery({
    queryKey: SUBSCRIPTION_KEYS.history(),
    queryFn: subscriptionApi.getHistory,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Get usage statistics
export function useSubscriptionUsage() {
  return useQuery({
    queryKey: SUBSCRIPTION_KEYS.usage(),
    queryFn: subscriptionApi.getUsage,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Get promotional offers
export function useSubscriptionOffers() {
  return useQuery({
    queryKey: SUBSCRIPTION_KEYS.offers(),
    queryFn: subscriptionApi.getOffers,
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
}

// Create subscription mutation
export function useCreateSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSubscriptionRequest) =>
      subscriptionApi.createSubscription(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_KEYS.status() });
      queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_KEYS.history() });
    },
  });
}

// Update subscription mutation
export function useUpdateSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateSubscriptionRequest) =>
      subscriptionApi.updateSubscription(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_KEYS.status() });
      queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_KEYS.history() });
    },
  });
}

// Cancel subscription mutation
export function useCancelSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CancelSubscriptionRequest) =>
      subscriptionApi.cancelSubscription(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_KEYS.status() });
      queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_KEYS.history() });
    },
  });
}

// Resume subscription mutation
export function useResumeSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: subscriptionApi.resumeSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_KEYS.status() });
      queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_KEYS.history() });
    },
  });
}

// Verify purchase mutation
export function useVerifyPurchase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: VerifyPurchaseRequest) =>
      subscriptionApi.verifyPurchase(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_KEYS.status() });
      queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_KEYS.history() });
    },
  });
}

// Restore purchases mutation
export function useRestorePurchases() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: subscriptionApi.restorePurchases,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_KEYS.status() });
      queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_KEYS.history() });
    },
  });
}

// Start trial mutation
export function useStartTrial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (planId: string) => subscriptionApi.startTrial(planId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_KEYS.status() });
      queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_KEYS.history() });
    },
  });
}
