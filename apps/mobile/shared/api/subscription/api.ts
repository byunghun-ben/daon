import type {
  CancelSubscriptionRequest,
  CreateSubscriptionRequest,
  UpdateSubscriptionRequest,
  VerifyPurchaseRequest,
} from "@daon/shared";

export const subscriptionApi = {
  getPlans: async () => {
    const response = await fetch("/api/subscription/plans");
    return response.json();
  },
  getStatus: async () => {
    const response = await fetch("/api/subscription/status");
    return response.json();
  },
  getHistory: async () => {
    const response = await fetch("/api/subscription/history");
    return response.json();
  },
  getUsage: async () => {
    const response = await fetch("/api/subscription/usage");
    return response.json();
  },
  getOffers: async () => {
    const response = await fetch("/api/subscription/offers");
    return response.json();
  },
  createSubscription: async (data: CreateSubscriptionRequest) => {
    const response = await fetch("/api/subscription", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response.json();
  },
  updateSubscription: async (data: UpdateSubscriptionRequest) => {
    const response = await fetch("/api/subscription", {
      method: "PUT",
      body: JSON.stringify(data),
    });
    return response.json();
  },
  cancelSubscription: async (data: CancelSubscriptionRequest) => {
    const response = await fetch("/api/subscription", {
      method: "DELETE",
      body: JSON.stringify(data),
    });
    return response.json();
  },
  resumeSubscription: async () => {
    const response = await fetch("/api/subscription/resume", {
      method: "POST",
    });
    return response.json();
  },
  verifyPurchase: async (data: VerifyPurchaseRequest) => {
    const response = await fetch("/api/subscription/verify", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response.json();
  },
  restorePurchases: async () => {
    const response = await fetch("/api/subscription/restore", {
      method: "POST",
    });
    return response.json();
  },
  startTrial: async (planId: string) => {
    const response = await fetch("/api/subscription/trial", {
      method: "POST",
      body: JSON.stringify({ planId }),
    });
    return response.json();
  },
};
