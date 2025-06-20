import { apiClient } from "./client";

// Diary API types
export interface DiaryEntry {
  id: string;
  child_id: string;
  user_id: string;
  date: string;
  content: string;
  photos: string[];
  videos: string[];
  created_at: string;
  updated_at: string;
  milestones?: Milestone[];
}

export interface Milestone {
  id: string;
  type: "first_smile" | "first_step" | "first_word" | "custom";
  description: string;
  achieved_at: string;
  diary_entry_id?: string;
  child_id: string;
}

export interface CreateDiaryEntryRequest {
  child_id: string;
  date: string;
  content: string;
  photos?: string[];
  videos?: string[];
}

export interface UpdateDiaryEntryRequest {
  date?: string;
  content?: string;
  photos?: string[];
  videos?: string[];
}

export interface CreateMilestoneRequest {
  type: "first_smile" | "first_step" | "first_word" | "custom";
  description: string;
  achieved_at: string;
  diary_entry_id?: string;
  child_id: string;
}

export interface DiaryFilters {
  child_id?: string;
  date_from?: string;
  date_to?: string;
  limit?: number;
  offset?: number;
}

export interface DiaryEntriesResponse {
  diaryEntries: DiaryEntry[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
}

export interface DiaryEntryResponse {
  diaryEntry: DiaryEntry;
}

export interface MilestoneResponse {
  milestone: Milestone;
}

// Diary API functions
export const diaryApi = {
  async createDiaryEntry(data: CreateDiaryEntryRequest): Promise<DiaryEntryResponse> {
    return apiClient.post<DiaryEntryResponse>("/diary", data);
  },

  async getDiaryEntries(filters?: DiaryFilters): Promise<DiaryEntriesResponse> {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/diary?${queryString}` : "/diary";
    
    return apiClient.get<DiaryEntriesResponse>(endpoint);
  },

  async getDiaryEntry(id: string): Promise<DiaryEntryResponse> {
    return apiClient.get<DiaryEntryResponse>(`/diary/${id}`);
  },

  async updateDiaryEntry(id: string, data: UpdateDiaryEntryRequest): Promise<DiaryEntryResponse> {
    return apiClient.put<DiaryEntryResponse>(`/diary/${id}`, data);
  },

  async deleteDiaryEntry(id: string): Promise<void> {
    return apiClient.delete(`/diary/${id}`);
  },

  async addMilestone(data: CreateMilestoneRequest): Promise<MilestoneResponse> {
    return apiClient.post<MilestoneResponse>("/diary/milestones", data);
  },
};