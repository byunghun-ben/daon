import { CreateDiaryForm } from "@/features/diary/CreateDiaryForm";
import { Stack, useRouter } from "expo-router";
import { View } from "react-native";

export default function NewDiaryScreen() {
  const router = useRouter();

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
      <View className="flex-1 bg-background pt-6">
        <CreateDiaryForm onSuccess={handleSuccess} />
      </View>
    </>
  );
}
