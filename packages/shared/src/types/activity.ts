// 활동 기록 관련 타입
export interface Activity {
  id: string;
  childId: string;
  userId: string;
  type: ActivityType;
  timestamp: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  feedingData?: FeedingData;
  diaperData?: DiaperData;
  sleepData?: SleepData;
  tummyTimeData?: TummyTimeData;
  user: {
    id: string;
    name: string;
  };
}

export interface CreateActivityRequest {
  childId: string;
  type: ActivityType;
  timestamp: string;
  notes?: string;
  feedingData?: CreateFeedingDataRequest;
  diaperData?: CreateDiaperDataRequest;
  sleepData?: CreateSleepDataRequest;
  tummyTimeData?: CreateTummyTimeDataRequest;
}

export enum ActivityType {
  FEEDING = "FEEDING",
  DIAPER = "DIAPER",
  SLEEP = "SLEEP",
  TUMMY_TIME = "TUMMY_TIME",
  CUSTOM = "CUSTOM",
}

// 수유 데이터
export interface FeedingData {
  id: string;
  activityId: string;
  type: FeedingType;
  amount?: number; // ml
  duration?: number; // minutes
  side?: BreastSide;
}

export interface CreateFeedingDataRequest {
  type: FeedingType;
  amount?: number;
  duration?: number;
  side?: BreastSide;
}

export enum FeedingType {
  BREAST = "BREAST",
  BOTTLE = "BOTTLE",
  SOLID = "SOLID",
}

export enum BreastSide {
  LEFT = "LEFT",
  RIGHT = "RIGHT",
  BOTH = "BOTH",
}

// 기저귀 데이터
export interface DiaperData {
  id: string;
  activityId: string;
  type: DiaperType;
}

export interface CreateDiaperDataRequest {
  type: DiaperType;
}

export enum DiaperType {
  WET = "WET",
  DIRTY = "DIRTY",
  BOTH = "BOTH",
}

// 수면 데이터
export interface SleepData {
  id: string;
  activityId: string;
  startTime: string;
  endTime?: string;
  quality?: SleepQuality;
}

export interface CreateSleepDataRequest {
  startTime: string;
  endTime?: string;
  quality?: SleepQuality;
}

export enum SleepQuality {
  GOOD = "GOOD",
  FAIR = "FAIR",
  POOR = "POOR",
}

// 배밀이 데이터
export interface TummyTimeData {
  id: string;
  activityId: string;
  duration: number; // minutes
}

export interface CreateTummyTimeDataRequest {
  duration: number;
}
