import {
  ActivitiesResponse,
  ActivityFilters,
  ActivityResponse,
  ActivitySummaryResponse,
  CreateActivityRequest,
  UpdateActivityRequest,
} from "@daon/shared";
import { apiClient } from "./client";

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

  async updateActivity(
    id: string,
    data: UpdateActivityRequest
  ): Promise<ActivityResponse> {
    return apiClient.put<ActivityResponse>(`/activities/${id}`, data);
  },

  async deleteActivity(id: string): Promise<void> {
    return apiClient.delete(`/activities/${id}`);
  },

  async getActivitySummary(childId: string): Promise<ActivitySummaryResponse> {
    return apiClient.get(`/activities/summary/${childId}`);
  },
};
