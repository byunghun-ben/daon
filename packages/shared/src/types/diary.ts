// 일기 및 마일스톤 관련 타입
export interface DiaryEntry {
  id: string;
  childId: string;
  userId: string;
  date: string;
  content: string;
  photos: string[];
  videos: string[];
  createdAt: string;
  updatedAt: string;
  milestones: Milestone[];
  user: {
    id: string;
    name: string;
  };
}

export interface CreateDiaryEntryRequest {
  childId: string;
  date: string;
  content: string;
  photos?: string[];
  videos?: string[];
  milestones?: CreateMilestoneRequest[];
}

export interface UpdateDiaryEntryRequest {
  content?: string;
  photos?: string[];
  videos?: string[];
}

// 마일스톤
export interface Milestone {
  id: string;
  childId: string;
  type: MilestoneType;
  description: string;
  achievedAt: string;
  createdAt: string;
  diaryEntryId?: string;
}

export interface CreateMilestoneRequest {
  type: MilestoneType;
  description: string;
  achievedAt: string;
}

export enum MilestoneType {
  FIRST_SMILE = 'FIRST_SMILE',
  FIRST_STEP = 'FIRST_STEP',
  FIRST_WORD = 'FIRST_WORD',
  SITTING_UP = 'SITTING_UP',
  CRAWLING = 'CRAWLING',
  WALKING = 'WALKING',
  TALKING = 'TALKING',
  CUSTOM = 'CUSTOM',
}