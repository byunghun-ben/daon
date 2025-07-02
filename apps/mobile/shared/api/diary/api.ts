import {
  CreateDiaryEntryRequest,
  CreateMilestoneRequest,
  DiaryEntriesResponse,
  DiaryEntryResponse,
  DiaryFilters,
  MilestoneApi,
  UpdateDiaryEntryRequest,
} from "@daon/shared";
import { apiClient } from "../client";

export interface MilestoneResponse {
  milestone: MilestoneApi;
}

// Diary API functions
export const diaryApi = {
  async createDiaryEntry(
    data: CreateDiaryEntryRequest,
  ): Promise<DiaryEntryResponse> {
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

  async updateDiaryEntry(
    id: string,
    data: UpdateDiaryEntryRequest,
  ): Promise<DiaryEntryResponse> {
    return apiClient.put<DiaryEntryResponse>(`/diary/${id}`, data);
  },

  async deleteDiaryEntry(id: string): Promise<void> {
    return apiClient.delete(`/diary/${id}`);
  },

  async addMilestone(data: CreateMilestoneRequest): Promise<MilestoneResponse> {
    return apiClient.post<MilestoneResponse>("/diary/milestones", data);
  },
};
