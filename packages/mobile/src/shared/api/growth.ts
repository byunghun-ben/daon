import { apiClient } from "./client";

// Growth API types
export interface GrowthRecord {
  id: string;
  child_id: string;
  user_id: string;
  recorded_at: string;
  age_in_days: number;
  height_cm?: number;
  weight_kg?: number;
  head_circumference_cm?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateGrowthRecordRequest {
  child_id: string;
  recorded_at: string;
  height_cm?: number;
  weight_kg?: number;
  head_circumference_cm?: number;
  notes?: string;
}

export interface UpdateGrowthRecordRequest {
  recorded_at?: string;
  height_cm?: number;
  weight_kg?: number;
  head_circumference_cm?: number;
  notes?: string;
}

export interface GrowthFilters {
  child_id?: string;
  date_from?: string;
  date_to?: string;
  limit?: number;
  offset?: number;
}

export interface GrowthRecordsResponse {
  growthRecords: GrowthRecord[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
}

export interface GrowthRecordResponse {
  growthRecord: GrowthRecord;
}

export interface GrowthChartData {
  childId: string;
  childName: string;
  birthDate: string;
  gender?: string;
  records: {
    date: string;
    ageInDays: number;
    height?: number;
    weight?: number;
    headCircumference?: number;
  }[];
  percentiles?: {
    height: { p3: number; p10: number; p25: number; p50: number; p75: number; p90: number; p97: number }[];
    weight: { p3: number; p10: number; p25: number; p50: number; p75: number; p90: number; p97: number }[];
  };
}

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