import z from "zod/v4";

// 분석 기간 스키마
export const AnalyticsPeriodSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  period: z.enum(["day", "week", "month", "quarter", "year"]).default("week"),
});

// 수유 패턴 분석 스키마
export const FeedingPatternSchema = z.object({
  totalFeedings: z.number().nonnegative(),
  averageFeedingsPerDay: z.number().nonnegative(),
  totalVolume: z.number().nonnegative().nullable(), // ml
  averageVolumePerFeeding: z.number().nonnegative().nullable(),
  averageDuration: z.number().nonnegative().nullable(), // minutes
  feedingTypes: z.record(z.enum(["breast", "bottle", "solid"]), z.number()),
  feedingsByHour: z.array(
    z.object({
      hour: z.number().min(0).max(23),
      count: z.number().nonnegative(),
    }),
  ),
  feedingsByDay: z.array(
    z.object({
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      count: z.number().nonnegative(),
      totalVolume: z.number().nonnegative().nullable(),
    }),
  ),
  breastSideBalance: z
    .object({
      left: z.number().nonnegative(),
      right: z.number().nonnegative(),
      both: z.number().nonnegative(),
    })
    .nullable(),
});

// 수면 패턴 분석 스키마
export const SleepPatternSchema = z.object({
  totalSleepTime: z.number().nonnegative(), // minutes
  averageSleepPerDay: z.number().nonnegative(), // minutes
  nightSleepTime: z.number().nonnegative(), // minutes (22:00-06:00)
  dayNapTime: z.number().nonnegative(), // minutes (06:00-22:00)
  sleepSessions: z.number().nonnegative(),
  averageSessionDuration: z.number().nonnegative(), // minutes
  longestSleep: z.number().nonnegative(), // minutes
  sleepQuality: z.record(z.enum(["good", "fair", "poor"]), z.number()),
  sleepByHour: z.array(
    z.object({
      hour: z.number().min(0).max(23),
      sleepingPercentage: z.number().min(0).max(100),
    }),
  ),
  sleepByDay: z.array(
    z.object({
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      totalSleep: z.number().nonnegative(),
      nightSleep: z.number().nonnegative(),
      napTime: z.number().nonnegative(),
      quality: z.enum(["good", "fair", "poor"]).nullable(),
    }),
  ),
});

// 성장 패턴 분석 스키마
export const GrowthPatternSchema = z.object({
  latestMeasurement: z.object({
    weight: z.number().positive().nullable(),
    height: z.number().positive().nullable(),
    headCircumference: z.number().positive().nullable(),
    recordedAt: z.iso.datetime({ offset: true }),
    ageInDays: z.number().nonnegative(),
  }),
  growthTrend: z.object({
    weight: z
      .object({
        trend: z.enum(["increasing", "stable", "decreasing"]),
        changeRate: z.number(), // per day
        percentile: z.number().min(0).max(100).nullable(),
      })
      .nullable(),
    height: z
      .object({
        trend: z.enum(["increasing", "stable", "decreasing"]),
        changeRate: z.number(), // per day
        percentile: z.number().min(0).max(100).nullable(),
      })
      .nullable(),
    headCircumference: z
      .object({
        trend: z.enum(["increasing", "stable", "decreasing"]),
        changeRate: z.number(), // per day
        percentile: z.number().min(0).max(100).nullable(),
      })
      .nullable(),
  }),
  measurementHistory: z.array(
    z.object({
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      weight: z.number().positive().nullable(),
      height: z.number().positive().nullable(),
      headCircumference: z.number().positive().nullable(),
      ageInDays: z.number().nonnegative(),
    }),
  ),
  whoPercentiles: z.object({
    weight: z
      .array(
        z.object({
          ageInDays: z.number().nonnegative(),
          p3: z.number(),
          p10: z.number(),
          p25: z.number(),
          p50: z.number(),
          p75: z.number(),
          p90: z.number(),
          p97: z.number(),
        }),
      )
      .nullable(),
    height: z
      .array(
        z.object({
          ageInDays: z.number().nonnegative(),
          p3: z.number(),
          p10: z.number(),
          p25: z.number(),
          p50: z.number(),
          p75: z.number(),
          p90: z.number(),
          p97: z.number(),
        }),
      )
      .nullable(),
  }),
});

// 기저귀 패턴 분석 스키마
export const DiaperPatternSchema = z.object({
  totalChanges: z.number().nonnegative(),
  averageChangesPerDay: z.number().nonnegative(),
  changeTypes: z.record(z.enum(["wet", "dirty", "both"]), z.number()),
  changesByHour: z.array(
    z.object({
      hour: z.number().min(0).max(23),
      count: z.number().nonnegative(),
    }),
  ),
  changesByDay: z.array(
    z.object({
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      count: z.number().nonnegative(),
      wetCount: z.number().nonnegative(),
      dirtyCount: z.number().nonnegative(),
    }),
  ),
});

// 전체 활동 요약 스키마
export const ActivitySummarySchema = z.object({
  totalActivities: z.number().nonnegative(),
  activitiesByType: z.record(z.string(), z.number()),
  activitiesByDay: z.array(
    z.object({
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      count: z.number().nonnegative(),
      types: z.record(z.string(), z.number()),
    }),
  ),
  mostActiveHours: z.array(
    z.object({
      hour: z.number().min(0).max(23),
      count: z.number().nonnegative(),
    }),
  ),
});

// 인사이트 및 추천 스키마
export const InsightSchema = z.object({
  type: z.enum(["pattern", "anomaly", "recommendation", "milestone"]),
  severity: z.enum(["info", "warning", "critical"]),
  title: z.string(),
  description: z.string(),
  actionRequired: z.boolean(),
  relatedData: z.record(z.string(), z.unknown()).optional(),
  createdAt: z.string().datetime(),
});

// 종합 분석 응답 스키마
export const AnalyticsResponseSchema = z.object({
  period: AnalyticsPeriodSchema,
  feedingPattern: FeedingPatternSchema.nullable(),
  sleepPattern: SleepPatternSchema.nullable(),
  growthPattern: GrowthPatternSchema.nullable(),
  diaperPattern: DiaperPatternSchema.nullable(),
  activitySummary: ActivitySummarySchema,
  insights: z.array(InsightSchema),
  generatedAt: z.iso.datetime({ offset: true }),
});

// Request 스키마
export const AnalyticsRequestSchema = z.object({
  childId: z.uuid(),
  period: AnalyticsPeriodSchema,
  includePatterns: z
    .array(z.enum(["feeding", "sleep", "growth", "diaper", "activity"]))
    .default(["feeding", "sleep", "growth", "diaper", "activity"]),
});

// 비교 분석 스키마
export const ComparisonAnalyticsSchema = z.object({
  current: AnalyticsResponseSchema,
  previous: AnalyticsResponseSchema.nullable(),
  comparison: z.object({
    feedingTrend: z.enum(["improving", "stable", "declining"]).nullable(),
    sleepTrend: z.enum(["improving", "stable", "declining"]).nullable(),
    growthTrend: z.enum(["normal", "accelerated", "slow"]).nullable(),
    significantChanges: z.array(
      z.object({
        metric: z.string(),
        change: z.number(),
        changeType: z.enum(["increase", "decrease"]),
        significance: z.enum(["minor", "moderate", "major"]),
      }),
    ),
  }),
});

// 인퍼드 타입들
export type AnalyticsPeriod = z.infer<typeof AnalyticsPeriodSchema>;
export type FeedingPattern = z.infer<typeof FeedingPatternSchema>;
export type SleepPattern = z.infer<typeof SleepPatternSchema>;
export type GrowthPattern = z.infer<typeof GrowthPatternSchema>;
export type DiaperPattern = z.infer<typeof DiaperPatternSchema>;
export type ActivitySummary = z.infer<typeof ActivitySummarySchema>;
export type Insight = z.infer<typeof InsightSchema>;
export type AnalyticsResponse = z.infer<typeof AnalyticsResponseSchema>;
export type AnalyticsRequest = z.infer<typeof AnalyticsRequestSchema>;
export type ComparisonAnalytics = z.infer<typeof ComparisonAnalyticsSchema>;
