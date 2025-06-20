import { apiClient } from "./client";

// Activity API types
export interface Activity {
  id: string;
  child_id: string;
  user_id: string;
  type: "feeding" | "diaper" | "sleep" | "tummy_time" | "custom";
  started_at: string;
  ended_at?: string;
  notes?: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CreateActivityRequest {
  child_id: string;
  type: "feeding" | "diaper" | "sleep" | "tummy_time" | "custom";
  started_at: string;
  ended_at?: string;
  notes?: string;
  metadata?: Record<string, any>;
}

export interface UpdateActivityRequest {
  started_at?: string;
  ended_at?: string;
  notes?: string;
  metadata?: Record<string, any>;
}

export interface ActivityFilters {
  child_id?: string;
  type?: string;
  date_from?: string;
  date_to?: string;
  limit?: number;
  offset?: number;
}

export interface ActivitiesResponse {
  activities: Activity[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
}

export interface ActivityResponse {
  activity: Activity;
}

// Activities API functions
export const activitiesApi = {
  async createActivity(data: CreateActivityRequest): Promise<ActivityResponse> {
    return apiClient.post<ActivityResponse>("/activities", data);
  },

  async getActivities(filters?: ActivityFilters): Promise<ActivitiesResponse> {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/activities?${queryString}` : "/activities";
    
    return apiClient.get<ActivitiesResponse>(endpoint);
  },

  async getActivity(id: string): Promise<ActivityResponse> {
    return apiClient.get<ActivityResponse>(`/activities/${id}`);
  },

  async updateActivity(id: string, data: UpdateActivityRequest): Promise<ActivityResponse> {
    return apiClient.put<ActivityResponse>(`/activities/${id}`, data);
  },

  async deleteActivity(id: string): Promise<void> {
    return apiClient.delete(`/activities/${id}`);
  },

  async getActivitySummary(childId: string): Promise<any> {
    return apiClient.get(`/activities/summary/${childId}`);
  },
};