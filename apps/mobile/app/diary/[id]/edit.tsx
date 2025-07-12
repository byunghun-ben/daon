import { UpdateDiaryForm } from "@/features/diary/UpdateDiaryForm";
import { useDiaryEntry } from "@/shared/api/diary/hooks/useDiaryEntry";
import { useTranslation } from "@/shared/hooks/useTranslation";
import Button from "@/shared/ui/Button/Button";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EditDiaryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation();

  const { data: diaryEntryData, isLoading, error } = useDiaryEntry(id!);
  const diaryEntry = diaryEntryData?.diaryEntry;

  const handleSuccess = () => {
    // 수정 성공 후 상세 페이지로 돌아가기
    router.back();
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <Stack.Screen
          options={{
            title: "일기 수정",
            headerBackTitle: "뒤로",
          }}
        />
        <View className="flex-1 justify-center items-center">
          <Text className="text-base text-text-secondary">로딩 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !diaryEntry) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <Stack.Screen
          options={{
            title: "일기 수정",
            headerBackTitle: "뒤로",
          }}
        />
        <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
          <View className="flex-1 justify-center items-center px-4">
            <Text className="text-base text-destructive text-center mb-4">
              일기를 불러오는데 실패했습니다.
            </Text>
            <Button title="다시 시도" onPress={() => router.back()} />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "일기 수정",
          headerBackTitle: "취소",
        }}
      />
      <SafeAreaView
        className="flex-1 bg-background"
        edges={["left", "right", "bottom"]}
      >
        <View className="flex-1 py-6">
          <UpdateDiaryForm diaryEntry={diaryEntry} onSuccess={handleSuccess} />
        </View>
      </SafeAreaView>
    </>
  );
}
