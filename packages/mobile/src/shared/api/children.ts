import {
  AcceptInviteRequest,
  ChildrenResponse,
  ChildResponse,
  CreateChildRequest,
  UpdateChildRequest,
} from "@daon/shared";
import { apiClient } from "./client";

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

  async updateChild(
    id: string,
    data: UpdateChildRequest
  ): Promise<ChildResponse> {
    return apiClient.put<ChildResponse>(`/children/${id}`, data);
  },

  async deleteChild(id: string): Promise<void> {
    return apiClient.delete(`/children/${id}`);
  },

  async joinChild(data: AcceptInviteRequest): Promise<ChildResponse> {
    return apiClient.post<ChildResponse>("/children/join", data);
  },
};
