import {
  CreateSubscriptionRequest,
  UpdateSubscriptionRequest,
  CancelSubscriptionRequest,
  VerifyPurchaseRequest,
  SubscriptionStatusResponse,
  SubscriptionPlansResponse,
} from "@daon/shared";
import { apiClient } from "../client";

export const subscriptionApi = {
  // Get available subscription plans
  async getPlans(): Promise<SubscriptionPlansResponse> {
    const response = await apiClient.get<SubscriptionPlansResponse>("/subscription/plans");
    return response;
  },

  // Get current subscription status
  async getStatus(): Promise<SubscriptionStatusResponse> {
    const response = await apiClient.get<SubscriptionStatusResponse>("/subscription/status");
    return response;
  },

  // Create new subscription
  async createSubscription(data: CreateSubscriptionRequest) {
    const response = await apiClient.post("/subscription", data);
    return response;
  },

  // Update existing subscription
  async updateSubscription(data: UpdateSubscriptionRequest) {
    const response = await apiClient.patch("/subscription", data);
    return response;
  },

  // Cancel subscription
  async cancelSubscription(data: CancelSubscriptionRequest) {
    const response = await apiClient.post("/subscription/cancel", data);
    return response;
  },

  // Resume canceled subscription
  async resumeSubscription() {
    const response = await apiClient.post("/subscription/resume");
    return response;
  },

  // Verify in-app purchase
  async verifyPurchase(data: VerifyPurchaseRequest) {
    const response = await apiClient.post("/subscription/verify-purchase", data);
    return response;
  },

  // Restore purchases
  async restorePurchases() {
    const response = await apiClient.post("/subscription/restore");
    return response;
  },

  // Get subscription history
  async getHistory() {
    const response = await apiClient.get("/subscription/history");
    return response;
  },

  // Get usage statistics
  async getUsage() {
    const response = await apiClient.get("/subscription/usage");
    return response;
  },

  // Start free trial
  async startTrial(planId: string) {
    const response = await apiClient.post("/subscription/trial", { planId });
    return response;
  },

  // Get promotional offers
  async getOffers() {
    const response = await apiClient.get("/subscription/offers");
    return response;
  },
};