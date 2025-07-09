import { CreateGrowthRecordForm } from "@/features/growth/CreateGrowthRecordForm";
import { useThemedStyles } from "@/shared/lib/hooks/useTheme";
import { Stack, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NewGrowthScreen() {
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
          title: "새 성장 기록",
          headerBackTitle: "뒤로",
        }}
      />
      <SafeAreaView style={styles.container}>
        <CreateGrowthRecordForm onSuccess={handleSuccess} />
      </SafeAreaView>
    </>
  );
}
