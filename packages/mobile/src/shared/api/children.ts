import { apiClient } from "./client";

// Child API types
export interface Child {
  id: string;
  user_id: string;
  name: string;
  birth_date: string;
  gender?: "male" | "female" | "other";
  photo_url?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateChildRequest {
  name: string;
  birth_date: string;
  gender?: "male" | "female" | "other";
  photo_url?: string;
}

export interface UpdateChildRequest {
  name?: string;
  birth_date?: string;
  gender?: "male" | "female" | "other";
  photo_url?: string;
}

export interface ChildrenResponse {
  children: Child[];
}

export interface ChildResponse {
  child: Child;
}

// Children API functions
export const childrenApi = {
  async createChild(data: CreateChildRequest): Promise<ChildResponse> {
    return apiClient.post<ChildResponse>("/children", data);
  },

  async getChildren(): Promise<ChildrenResponse> {
    return apiClient.get<ChildrenResponse>("/children");
  },

  async getChild(id: string): Promise<ChildResponse> {
    return apiClient.get<ChildResponse>(`/children/${id}`);
  },

  async updateChild(id: string, data: UpdateChildRequest): Promise<ChildResponse> {
    return apiClient.put<ChildResponse>(`/children/${id}`, data);
  },

  async deleteChild(id: string): Promise<void> {
    return apiClient.delete(`/children/${id}`);
  },

  async joinChild(inviteCode: string): Promise<ChildResponse> {
    return apiClient.post<ChildResponse>("/children/join", { inviteCode });
  },
};