import type {
  CreateFcmTokenRequest,
  DeleteFcmTokenRequest,
  FcmTokenResponse,
  FcmTokensResponse,
  NotificationResponse,
  SendNotificationRequest,
  SendTopicNotificationRequest,
} from "@daon/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "../../client";
import { createQueryKeys } from "../createCrudHooks";

// Query Keys
export const FCM_TOKENS_KEYS = createQueryKeys("fcm_tokens");

// FCM 토큰 등록
export function useRegisterFcmToken() {
  const queryClient = useQueryClient();

  return useMutation<FcmTokenResponse, Error, CreateFcmTokenRequest>({
    mutationFn: async (data) => {
      const response = await apiClient.post<FcmTokenResponse>(
        "/api/notifications/register",
        data,
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: FCM_TOKENS_KEYS.all,
      });
    },
  });
}

// FCM 토큰 해제
export function useUnregisterFcmToken() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, DeleteFcmTokenRequest>({
    mutationFn: async (data) => {
      await apiClient.delete("/api/notifications/unregister", { data });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: FCM_TOKENS_KEYS.all,
      });
    },
  });
}

// 사용자 FCM 토큰 조회
export function useUserFcmTokens() {
  return useQuery<FcmTokensResponse, Error>({
    queryKey: FCM_TOKENS_KEYS.all,
    queryFn: async () => {
      const response = await apiClient.get<FcmTokensResponse>(
        "/api/notifications/tokens",
      );
      return response;
    },
  });
}

// 알림 발송 (관리자용)
export function useSendNotification() {
  return useMutation<NotificationResponse, Error, SendNotificationRequest>({
    mutationFn: async (data) => {
      const response = await apiClient.post<NotificationResponse>(
        "/api/notifications/send",
        data,
      );
      return response;
    },
  });
}

// 토픽 알림 발송 (관리자용)
export function useSendTopicNotification() {
  return useMutation<NotificationResponse, Error, SendTopicNotificationRequest>(
    {
      mutationFn: async (data) => {
        const response = await apiClient.post<NotificationResponse>(
          "/api/notifications/send-to-topic",
          data,
        );
        return response;
      },
    },
  );
}
