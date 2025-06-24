import React from "react";
import { Alert, SafeAreaView } from "react-native";
import { useOnboardingStore } from "../../shared/store";
import { ChildRegistrationWidget } from "../../widgets/create-child";
import { OnboardingCreateChildScreenProps } from "../../shared/types/navigation";
import { useThemedStyles } from "../../shared/lib/hooks/useTheme";

export default function CreateChildScreen(
  _props: OnboardingCreateChildScreenProps,
) {
  // Zustand 스토어에서 complete 함수 가져오기
  const completeOnboarding = useOnboardingStore((state) => state.complete);

  const styles = useThemedStyles((theme) => ({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
  }));

  const handleSuccess = (childData: any) => {
    // 아이 생성 또는 참여 성공 메시지를 구분
    const isJoin = childData.role !== "owner";
    const message = isJoin
      ? `${childData.child?.name || "아이"}에 성공적으로 참여했습니다!`
      : "아이 프로필이 생성되었습니다!";

    Alert.alert("성공", message, [
      {
        text: "확인",
        onPress: () => {
          // 스토어의 complete 함수 사용 (온보딩 완료)
          completeOnboarding();
        },
      },
    ]);
  };

  const handleError = (error: any) => {
    Alert.alert("오류", error.message || "처리 중 오류가 발생했습니다.");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ChildRegistrationWidget
        onSuccess={handleSuccess}
        onError={handleError}
        initialTab="create"
      />
    </SafeAreaView>
  );
}
