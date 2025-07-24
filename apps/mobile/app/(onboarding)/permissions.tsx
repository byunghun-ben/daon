import { useThemedStyles } from "@/shared/lib/hooks/useTheme";
import { ButtonV2, ButtonText } from "@/shared/ui/Button/ButtonV2";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Text, View } from "react-native";

export default function PermissionsScreen() {
  const router = useRouter();
  const [isRequesting, setIsRequesting] = useState(false);

  const handleRequestPermissions = async () => {
    setIsRequesting(true);

    try {
      // 미디어 라이브러리 권한 요청
      const { status: mediaStatus } =
        await MediaLibrary.requestPermissionsAsync();

      // 카메라 권한 요청
      const { status: cameraStatus } =
        await ImagePicker.requestCameraPermissionsAsync();

      // 알림 권한 요청
      const { status: notificationStatus } =
        await Notifications.requestPermissionsAsync();

      const allPermissionsGranted =
        mediaStatus === "granted" &&
        cameraStatus === "granted" &&
        notificationStatus === "granted";

      if (allPermissionsGranted) {
        Alert.alert(
          "권한 설정 완료",
          "모든 권한이 허용되었습니다. 이제 다온의 모든 기능을 사용할 수 있어요!",
          [{ text: "확인", onPress: () => router.replace("/(tabs)") }],
        );
      } else {
        Alert.alert(
          "권한 설정",
          "일부 권한이 거부되었습니다. 나중에 설정에서 권한을 허용할 수 있어요.",
          [
            { text: "설정에서 변경", onPress: handleSkip },
            { text: "계속", onPress: () => router.replace("/(tabs)") },
          ],
        );
      }
    } catch (error) {
      console.error("Permission request error:", error);
      Alert.alert(
        "오류",
        "권한 요청 중 문제가 발생했습니다. 계속 진행하겠습니다.",
        [{ text: "확인", onPress: () => router.replace("/(tabs)") }],
      );
    } finally {
      setIsRequesting(false);
    }
  };

  const handleSkip = () => {
    router.replace("/(tabs)");
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
    title: {
      fontSize: theme.typography.title.fontSize,
      fontWeight: theme.typography.title.fontWeight,
      color: theme.colors.text,
      textAlign: "center" as const,
      marginBottom: theme.spacing.md,
    },
    subtitle: {
      fontSize: theme.typography.body1.fontSize,
      color: theme.colors.textSecondary,
      textAlign: "center" as const,
      lineHeight: 20,
      marginBottom: theme.spacing.lg,
    },
    buttonContainer: {
      width: "100%" as const,
      gap: theme.spacing.md,
    },
  }));

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>앱 권한 설정</Text>
        <Text style={styles.subtitle}>
          다온의 모든 기능을 사용하려면{"\n"}다음 권한들이 필요해요:{"\n\n"}•
          사진/카메라: 아이 사진을 저장하고 촬영{"\n"}• 미디어 라이브러리: 기존
          사진 선택{"\n"}• 알림: 중요한 일정과 활동 알림
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <ButtonV2
          onPress={handleRequestPermissions}
          disabled={isRequesting}
          variant="default"
        >
          <ButtonText>
            {isRequesting ? "권한 요청 중..." : "권한 허용"}
          </ButtonText>
        </ButtonV2>
        <ButtonV2 onPress={handleSkip} variant="secondary">
          <ButtonText>나중에 설정</ButtonText>
        </ButtonV2>
      </View>
    </View>
  );
}
