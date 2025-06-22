import { apiClient } from "./client";
import {
  GrowthRecordApi,
  CreateGrowthRecordRequest,
  UpdateGrowthRecordRequest,
  GrowthFilters,
  GrowthRecordsResponse,
  GrowthRecordResponse,
  GrowthChartData,
} from "@daon/shared";

// Re-export types for easy access
export type { 
  GrowthRecordApi, 
  CreateGrowthRecordRequest, 
  UpdateGrowthRecordRequest, 
  GrowthFilters 
};
export type GrowthRecord = GrowthRecordApi;

// Growth API functions
export const growthApi = {
  async createGrowthRecord(data: CreateGrowthRecordRequest): Promise<GrowthRecordResponse> {
    return apiClient.post<GrowthRecordResponse>("/growth", data);
  },

  async getGrowthRecords(filters?: GrowthFilters): Promise<GrowthRecordsResponse> {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/growth?${queryString}` : "/growth";
    
    return apiClient.get<GrowthRecordsResponse>(endpoint);
  },

  async getGrowthRecord(id: string): Promise<GrowthRecordResponse> {
    return apiClient.get<GrowthRecordResponse>(`/growth/${id}`);
  },

  async updateGrowthRecord(id: string, data: UpdateGrowthRecordRequest): Promise<GrowthRecordResponse> {
    return apiClient.put<GrowthRecordResponse>(`/growth/${id}`, data);
  },

  async deleteGrowthRecord(id: string): Promise<void> {
    return apiClient.delete(`/growth/${id}`);
  },

  async getGrowthChart(childId: string): Promise<{ chart: GrowthChartData }> {
    return apiClient.get(`/growth/chart/${childId}`);
  },
};