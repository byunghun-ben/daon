/**
 * Zod 스키마를 활용한 타입 안전한 변환 유틸리티
 */

import type z from "zod/v4";

import type {
  ActivityApiSchema,
  ActivityDbSchema,
  ChildApiSchema,
  ChildDbSchema,
  DiaperDataApiSchema,
  DiaperDataDbSchema,
  DiaryEntryApiSchema,
  DiaryEntryDbSchema,
  FeedingDataApiSchema,
  FeedingDataDbSchema,
  GrowthRecordApiSchema,
  GrowthRecordDbSchema,
  MilestoneApiSchema,
  MilestoneDbSchema,
  SleepDataApiSchema,
  SleepDataDbSchema,
  TummyTimeDataApiSchema,
  TummyTimeDataDbSchema,
  UserApiSchema,
  UserDbSchema,
} from "../schemas";

// DB에서 API로 변환하는 매핑 함수들
export function convertChildDbToApi(
  dbChild: z.infer<typeof ChildDbSchema>
): z.infer<typeof ChildApiSchema> {
  return {
    id: dbChild.id,
    userId: dbChild.user_id,
    name: dbChild.name,
    birthDate: dbChild.birth_date,
    gender: dbChild.gender,
    photoUrl: dbChild.photo_url,
    createdAt: dbChild.created_at,
    updatedAt: dbChild.updated_at,
  };
}

export function convertUserDbToApi(
  dbUser: z.infer<typeof UserDbSchema>
): z.infer<typeof UserApiSchema> {
  return {
    id: dbUser.id,
    email: dbUser.email,
    name: dbUser.name,
    registrationStatus: dbUser.registration_status,
    createdAt: dbUser.created_at,
    updatedAt: dbUser.updated_at,
  };
}

export function convertFeedingDataDbToApi(
  dbData: z.infer<typeof FeedingDataDbSchema>
): z.infer<typeof FeedingDataApiSchema> {
  return {
    id: dbData.id,
    activityId: dbData.activity_id,
    type: dbData.type,
    amount: dbData.amount,
    duration: dbData.duration,
    side: dbData.side,
  };
}

export function convertDiaperDataDbToApi(
  dbData: z.infer<typeof DiaperDataDbSchema>
): z.infer<typeof DiaperDataApiSchema> {
  return {
    id: dbData.id,
    activityId: dbData.activity_id,
    type: dbData.type,
  };
}

export function convertSleepDataDbToApi(
  dbData: z.infer<typeof SleepDataDbSchema>
): z.infer<typeof SleepDataApiSchema> {
  return {
    id: dbData.id,
    activityId: dbData.activity_id,
    startedAt: dbData.started_at,
    endedAt: dbData.ended_at,
    quality: dbData.quality,
  };
}

export function convertTummyTimeDataDbToApi(
  dbData: z.infer<typeof TummyTimeDataDbSchema>
): z.infer<typeof TummyTimeDataApiSchema> {
  return {
    id: dbData.id,
    activityId: dbData.activity_id,
    duration: dbData.duration,
  };
}

export function convertMilestoneDbToApi(
  dbMilestone: z.infer<typeof MilestoneDbSchema>
): z.infer<typeof MilestoneApiSchema> {
  return {
    id: dbMilestone.id,
    diaryEntryId: dbMilestone.diary_entry_id,
    type: dbMilestone.type,
    title: dbMilestone.title,
    description: dbMilestone.description,
    achievedAt: dbMilestone.achieved_at,
  };
}

// 복합 객체 변환 함수들
type ActivityDbWithRelations = z.infer<typeof ActivityDbSchema> & {
  user: z.infer<typeof UserDbSchema>;
  feeding_data?: z.infer<typeof FeedingDataDbSchema>;
  diaper_data?: z.infer<typeof DiaperDataDbSchema>;
  sleep_data?: z.infer<typeof SleepDataDbSchema>;
  tummy_time_data?: z.infer<typeof TummyTimeDataDbSchema>;
};

export function convertActivityDbToApi(
  dbActivity: ActivityDbWithRelations
): z.infer<typeof ActivityApiSchema> {
  return {
    id: dbActivity.id,
    childId: dbActivity.child_id,
    userId: dbActivity.user_id,
    type: dbActivity.type,
    startedAt: dbActivity.started_at,
    endedAt: dbActivity.ended_at,
    notes: dbActivity.notes,
    createdAt: dbActivity.created_at,
    updatedAt: dbActivity.updated_at,
    user: convertUserDbToApi(dbActivity.user),
    feedingData: dbActivity.feeding_data
      ? convertFeedingDataDbToApi(dbActivity.feeding_data)
      : undefined,
    diaperData: dbActivity.diaper_data
      ? convertDiaperDataDbToApi(dbActivity.diaper_data)
      : undefined,
    sleepData: dbActivity.sleep_data
      ? convertSleepDataDbToApi(dbActivity.sleep_data)
      : undefined,
    tummyTimeData: dbActivity.tummy_time_data
      ? convertTummyTimeDataDbToApi(dbActivity.tummy_time_data)
      : undefined,
  };
}

type DiaryEntryDbWithRelations = z.infer<typeof DiaryEntryDbSchema> & {
  user: z.infer<typeof UserDbSchema>;
  milestones: z.infer<typeof MilestoneDbSchema>[];
};

export function convertDiaryEntryDbToApi(
  dbEntry: DiaryEntryDbWithRelations
): z.infer<typeof DiaryEntryApiSchema> {
  return {
    id: dbEntry.id,
    childId: dbEntry.child_id,
    userId: dbEntry.user_id,
    title: dbEntry.title,
    content: dbEntry.content,
    photos: dbEntry.photos,
    videos: dbEntry.videos,
    entryDate: dbEntry.entry_date,
    createdAt: dbEntry.created_at,
    updatedAt: dbEntry.updated_at,
    user: convertUserDbToApi(dbEntry.user),
    milestones: dbEntry.milestones.map(convertMilestoneDbToApi),
  };
}

type GrowthRecordDbWithRelations = z.infer<typeof GrowthRecordDbSchema> & {
  user: z.infer<typeof UserDbSchema>;
};

export function convertGrowthRecordDbToApi(
  dbRecord: GrowthRecordDbWithRelations
): z.infer<typeof GrowthRecordApiSchema> {
  return {
    id: dbRecord.id,
    childId: dbRecord.child_id,
    userId: dbRecord.user_id,
    weight: dbRecord.weight,
    height: dbRecord.height,
    headCircumference: dbRecord.head_circumference,
    recordedAt: dbRecord.recorded_at,
    notes: dbRecord.notes,
    createdAt: dbRecord.created_at,
    updatedAt: dbRecord.updated_at,
    user: convertUserDbToApi(dbRecord.user),
  };
}

// API에서 DB로 변환하는 함수들 (주로 요청 데이터 처리용)
export function convertChildApiToDb(
  apiChild: Omit<
    z.infer<typeof ChildApiSchema>,
    "id" | "createdAt" | "updatedAt"
  >
): Omit<z.infer<typeof ChildDbSchema>, "id" | "created_at" | "updated_at"> {
  return {
    user_id: apiChild.userId,
    name: apiChild.name,
    birth_date: apiChild.birthDate,
    gender: apiChild.gender,
    photo_url: apiChild.photoUrl,
  };
}

// 배열 변환 헬퍼 함수들
export function convertChildrenDbToApi(
  dbChildren: z.infer<typeof ChildDbSchema>[]
): z.infer<typeof ChildApiSchema>[] {
  return dbChildren.map(convertChildDbToApi);
}

export function convertActivitiesDbToApi(
  dbActivities: ActivityDbWithRelations[]
): z.infer<typeof ActivityApiSchema>[] {
  return dbActivities.map(convertActivityDbToApi);
}

export function convertDiaryEntriesDbToApi(
  dbEntries: DiaryEntryDbWithRelations[]
): z.infer<typeof DiaryEntryApiSchema>[] {
  return dbEntries.map(convertDiaryEntryDbToApi);
}

export function convertGrowthRecordsDbToApi(
  dbRecords: GrowthRecordDbWithRelations[]
): z.infer<typeof GrowthRecordApiSchema>[] {
  return dbRecords.map(convertGrowthRecordDbToApi);
}
