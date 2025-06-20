// Activity data types
export interface SleepData {
  startTime: string;
  endTime?: string;
  quality?: 'good' | 'fair' | 'poor';
}

export interface FeedingData {
  type: 'breast' | 'bottle' | 'solid';
  amount?: number;
  duration?: number;
  side?: 'left' | 'right' | 'both';
}

export interface DiaperData {
  type: 'wet' | 'dirty' | 'both';
  notes?: string;
}

export interface TummyTimeData {
  duration: number; // in minutes
  notes?: string;
}

export interface CustomActivityData {
  [key: string]: any;
}

export type ActivityData = 
  | SleepData 
  | FeedingData 
  | DiaperData 
  | TummyTimeData 
  | CustomActivityData;

// Type guards
export function isSleepData(data: any): data is SleepData {
  return data && typeof data === 'object' && typeof data.startTime === 'string';
}

export function isFeedingData(data: any): data is FeedingData {
  return data && typeof data === 'object' && 
         ['breast', 'bottle', 'solid'].includes(data.type);
}

export function isDiaperData(data: any): data is DiaperData {
  return data && typeof data === 'object' && 
         ['wet', 'dirty', 'both'].includes(data.type);
}

export function isTummyTimeData(data: any): data is TummyTimeData {
  return data && typeof data === 'object' && typeof data.duration === 'number';
}