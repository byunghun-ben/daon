import { z } from "zod";

// Subscription Plans
export const SubscriptionPlanSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  price: z.number().nonnegative(),
  currency: z.string().length(3), // ISO 4217 currency code
  interval: z.enum(["month", "year"]),
  intervalCount: z.number().int().positive().default(1),
  features: z.array(z.string()),
  isActive: z.boolean().default(true),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// User Subscription
export const UserSubscriptionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  planId: z.string(),
  status: z.enum([
    "active",
    "inactive", 
    "canceled",
    "past_due",
    "unpaid",
    "trialing"
  ]),
  currentPeriodStart: z.string().datetime(),
  currentPeriodEnd: z.string().datetime(),
  trialStart: z.string().datetime().nullable(),
  trialEnd: z.string().datetime().nullable(),
  canceledAt: z.string().datetime().nullable(),
  endedAt: z.string().datetime().nullable(),
  paymentMethodId: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Purchase Receipt
export const PurchaseReceiptSchema = z.object({
  id: z.string(),
  userId: z.string(),
  productId: z.string(),
  transactionId: z.string(),
  originalTransactionId: z.string().nullable(),
  platform: z.enum(["ios", "android"]),
  receipt: z.string(), // Base64 encoded receipt
  purchaseDate: z.string().datetime(),
  expirationDate: z.string().datetime().nullable(),
  isValid: z.boolean(),
  environment: z.enum(["sandbox", "production"]),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Subscription Usage
export const SubscriptionUsageSchema = z.object({
  id: z.string(),
  userId: z.string(),
  feature: z.string(),
  usage: z.number().nonnegative(),
  limit: z.number().nonnegative().nullable(),
  period: z.string(), // YYYY-MM format
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Premium Features
export const PremiumFeatureSchema = z.object({
  key: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.enum([
    "analytics",
    "storage", 
    "sharing",
    "export",
    "ai",
    "support"
  ]),
  requiredPlan: z.enum(["free", "premium", "family"]),
  usageLimit: z.number().nonnegative().nullable(),
  isEnabled: z.boolean().default(true),
});

// API Request/Response Types
export const CreateSubscriptionRequestSchema = z.object({
  planId: z.string(),
  paymentMethodId: z.string().optional(),
  trialDays: z.number().int().nonnegative().optional(),
});

export const UpdateSubscriptionRequestSchema = z.object({
  planId: z.string().optional(),
  paymentMethodId: z.string().optional(),
});

export const CancelSubscriptionRequestSchema = z.object({
  immediately: z.boolean().default(false),
  reason: z.string().optional(),
});

export const VerifyPurchaseRequestSchema = z.object({
  productId: z.string(),
  transactionId: z.string(),
  receipt: z.string(),
  platform: z.enum(["ios", "android"]),
});

export const SubscriptionStatusResponseSchema = z.object({
  subscription: UserSubscriptionSchema.nullable(),
  plan: SubscriptionPlanSchema.nullable(),
  features: z.array(PremiumFeatureSchema),
  usage: z.array(SubscriptionUsageSchema),
  isTrialAvailable: z.boolean(),
  trialDaysRemaining: z.number().int().nonnegative().nullable(),
});

export const SubscriptionPlansResponseSchema = z.object({
  plans: z.array(SubscriptionPlanSchema),
  currentPlan: SubscriptionPlanSchema.nullable(),
});

// Type exports
export type SubscriptionPlan = z.infer<typeof SubscriptionPlanSchema>;
export type UserSubscription = z.infer<typeof UserSubscriptionSchema>;
export type PurchaseReceipt = z.infer<typeof PurchaseReceiptSchema>;
export type SubscriptionUsage = z.infer<typeof SubscriptionUsageSchema>;
export type PremiumFeature = z.infer<typeof PremiumFeatureSchema>;

export type CreateSubscriptionRequest = z.infer<typeof CreateSubscriptionRequestSchema>;
export type UpdateSubscriptionRequest = z.infer<typeof UpdateSubscriptionRequestSchema>;
export type CancelSubscriptionRequest = z.infer<typeof CancelSubscriptionRequestSchema>;
export type VerifyPurchaseRequest = z.infer<typeof VerifyPurchaseRequestSchema>;

export type SubscriptionStatusResponse = z.infer<typeof SubscriptionStatusResponseSchema>;
export type SubscriptionPlansResponse = z.infer<typeof SubscriptionPlansResponseSchema>;

// Premium Feature Keys
export const PREMIUM_FEATURES = {
  UNLIMITED_CHILDREN: "unlimited_children",
  ADVANCED_ANALYTICS: "advanced_analytics", 
  AI_INSIGHTS: "ai_insights",
  CLOUD_BACKUP: "cloud_backup",
  DATA_EXPORT: "data_export",
  MULTIPLE_CAREGIVERS: "multiple_caregivers",
  PRIORITY_SUPPORT: "priority_support",
  CUSTOM_CATEGORIES: "custom_categories",
  UNLIMITED_PHOTOS: "unlimited_photos",
  EXPERT_CONSULTATION: "expert_consultation",
} as const;

// Subscription Plans
export const SUBSCRIPTION_PLANS = {
  FREE: "free",
  PREMIUM: "premium", 
  FAMILY: "family",
} as const;

// Usage Limits for Free Plan
export const FREE_PLAN_LIMITS = {
  CHILDREN: 1,
  PHOTOS_PER_MONTH: 50,
  CAREGIVERS: 2,
  EXPORT_PER_MONTH: 1,
  BACKUP_STORAGE_MB: 100,
} as const;