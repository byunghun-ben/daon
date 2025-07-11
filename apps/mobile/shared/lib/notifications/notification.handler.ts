import * as Notifications from "expo-notifications";
import { router } from "expo-router";

// 알림이 앱이 포그라운드에 있을 때 표시되도록 설정
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

class NotificationHandler {
  private notificationListener: Notifications.Subscription | null = null;
  private responseListener: Notifications.Subscription | null = null;

  /**
   * 알림 리스너 초기화
   */
  initialize() {
    // 알림 수신 리스너 (앱이 포그라운드에 있을 때)
    this.notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("Notification received:", notification);
        this.handleNotificationReceived(notification);
      },
    );

    // 알림 응답 리스너 (사용자가 알림을 탭했을 때)
    this.responseListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("Notification response:", response);
        this.handleNotificationResponse(response);
      });
  }

  /**
   * 알림 수신 처리
   */
  private handleNotificationReceived(notification: Notifications.Notification) {
    const { title, data } = notification.request.content;

    // 알림 타입에 따른 처리
    if (data?.type) {
      console.log(`Received ${data.type} notification:`, title);
    }
  }

  /**
   * 알림 탭 처리 (딥링크)
   */
  private handleNotificationResponse(
    response: Notifications.NotificationResponse,
  ) {
    const { data } = response.notification.request.content;

    // 딥링크 처리
    if (data?.childId && data?.type) {
      switch (data.type) {
        case "feeding":
        case "diaper":
        case "sleep":
        case "tummy_time":
          // 활동 기록 화면으로 이동
          router.push({
            pathname: "/record",
            params: {
              childId: data.childId as string,
              type: data.type as string,
            },
          });
          break;

        case "growth":
          // 성장 기록 화면으로 이동
          router.push({
            pathname: "/growth",
            params: { childId: data.childId as string },
          });
          break;

        case "diary":
          // 일기 화면으로 이동
          router.push({
            pathname: "/diary",
            params: { childId: data.childId as string },
          });
          break;

        case "milestone":
          // 마일스톤 화면으로 이동
          router.push({
            pathname: "/milestones",
            params: { childId: data.childId as string },
          });
          break;

        default:
          // 기본: 홈 화면으로 이동
          router.push("/(tabs)");
      }
    } else if (data?.activityId) {
      // 특정 활동 상세 화면으로 이동
      router.push({
        pathname: "/activities/[id]",
        params: { id: data.activityId as string },
      });
    } else if (data?.diaryId) {
      // 특정 일기 상세 화면으로 이동
      router.push({
        pathname: "/diary/[id]",
        params: { id: data.diaryId as string },
      });
    } else if (data?.growthId) {
      // 특정 성장 기록 상세 화면으로 이동
      router.push({
        pathname: "/growth/[id]",
        params: { id: data.growthId as string },
      });
    }
  }

  /**
   * 마지막 알림 응답 처리 (앱이 알림으로 실행된 경우)
   */
  async handleLastNotificationResponse() {
    const lastResponse = await Notifications.getLastNotificationResponseAsync();
    if (lastResponse) {
      this.handleNotificationResponse(lastResponse);
    }
  }

  /**
   * 리스너 정리
   */
  cleanup() {
    if (this.notificationListener) {
      this.notificationListener.remove();
      this.notificationListener = null;
    }
    if (this.responseListener) {
      this.responseListener.remove();
      this.responseListener = null;
    }
  }
}

export const notificationHandler = new NotificationHandler();
