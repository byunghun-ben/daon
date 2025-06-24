import React from "react";
import { Alert, Platform, Text, View } from "react-native";
import { openSettings, requestNotifications } from "react-native-permissions";
import { useThemedStyles } from "../../shared/lib/hooks/useTheme";
import { Button } from "../../shared/ui";

interface NotificationPermissionScreenProps {
  navigation: any;
  onComplete: () => void;
}

export const NotificationPermissionScreen = ({
  onComplete,
}: NotificationPermissionScreenProps) => {
  const handleRequestPermission = async () => {
    try {
      if (Platform.OS === "ios") {
        const result = await requestNotifications(["alert", "badge", "sound"]);
        if (result.status === "granted") {
          onComplete();
        } else {
          Alert.alert(
            "알림 권한",
            "알림을 받으려면 설정에서 권한을 허용해주세요.",
            [
              {
                text: "나중에",
                style: "cancel",
                onPress: () => onComplete(),
              },
              {
                text: "설정으로 이동",
                onPress: async () => {
                  await openSettings("notifications");
                  onComplete();
                },
              },
            ],
          );
        }
      } else {
        // Android 13+ (API 33+)에서만 POST_NOTIFICATIONS 권한이 존재
        onComplete(); // Android에서는 알림 권한 요청 스킵
      }
    } catch (error) {
      console.error("알림 권한 요청 중 오류:", error);
      onComplete(); // 오류 발생 시에도 계속 진행
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const styles = useThemedStyles((theme) => ({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      padding: theme.spacing.lg,
      justifyContent: "center" as const,
      alignItems: "center" as const,
    },
    content: {
      alignItems: "center" as const,
      marginBottom: theme.spacing.xl,
    },
    icon: {
      fontSize: 72,
      marginBottom: theme.spacing.lg,
    },
    title: {
      marginBottom: theme.spacing.md,
      textAlign: "center" as const,
    },
    description: {
      textAlign: "center" as const,
      marginBottom: theme.spacing.xl,
      color: theme.colors.text.secondary,
      lineHeight: 24,
    },
    buttonContainer: {
      width: "100%" as const,
      gap: theme.spacing.md,
    },
  }));

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.icon}>🔔</Text>
        <Text style={styles.title}>알림 허용</Text>
        <Text style={styles.description}>
          아이의 활동 시간, 성장 기록 등{"\n"}
          중요한 알림을 받으실 수 있습니다.{"\n\n"}
          언제든지 설정에서 변경하실 수 있어요.
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <Button title="알림 허용하기" onPress={handleRequestPermission} />
        <Button title="나중에" variant="secondary" onPress={handleSkip} />
      </View>
    </View>
  );
};
