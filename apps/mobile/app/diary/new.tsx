import { CreateDiaryForm } from "@/features/diary/CreateDiaryForm";
import { useThemedStyles } from "@/shared/lib/hooks/useTheme";
import { Stack, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NewDiaryScreen() {
  const router = useRouter();

  const styles = useThemedStyles((theme) => ({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
  }));

  const handleSuccess = () => {
    // 성공 후 이전 화면으로 돌아가기
    router.back();
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "새 일기 작성",
          headerBackTitle: "뒤로",
        }}
      />
      <SafeAreaView style={styles.container}>
        <CreateDiaryForm onSuccess={handleSuccess} />
      </SafeAreaView>
    </>
  );
}
