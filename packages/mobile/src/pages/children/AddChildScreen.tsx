import React from "react";
import { Alert, SafeAreaView } from "react-native";
import { CreateChildForm } from "../../widgets/create-child";
import { CreateChildScreenProps } from "../../shared/types/navigation";
import { useThemedStyles } from "../../shared/lib/hooks/useTheme";

export default function AddChildScreen({ navigation }: CreateChildScreenProps) {
  const styles = useThemedStyles((theme) => ({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
  }));

  const handleSuccess = () => {
    Alert.alert("성공", "아이 프로필이 생성되었습니다!", [
      {
        text: "확인",
        onPress: () => {
          // 앱 컨텍스트에서는 이전 화면으로 돌아가거나 메인 화면으로 이동
          if (navigation.canGoBack()) {
            navigation.goBack();
          } else {
            navigation.navigate("MainTabs");
          }
        },
      },
    ]);
  };

  const handleError = (error: any) => {
    Alert.alert(
      "오류",
      error.message || "아이 프로필 생성 중 오류가 발생했습니다.",
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <CreateChildForm
        onSuccess={handleSuccess}
        onError={handleError}
        title="새 아이 추가"
        subtitle="새로운 아이의 프로필을 만들어주세요"
      />
    </SafeAreaView>
  );
}
