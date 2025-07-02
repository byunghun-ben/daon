import { Stack, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { CreateActivityForm } from "../../features/activities";
import { useThemedStyles } from "../../shared/lib/hooks/useTheme";

export default function NewRecordScreen() {
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
          title: "새 활동 기록",
          headerBackTitle: "뒤로",
        }}
      />
      <SafeAreaView style={styles.container}>
        <CreateActivityForm onSuccess={handleSuccess} />
      </SafeAreaView>
    </>
  );
}
