import { useDeleteDiaryEntry } from "@/shared/api/diary/hooks/useDeleteDiaryEntry";
import { useDiaryEntry } from "@/shared/api/diary/hooks/useDiaryEntry";
import { useActiveChild } from "@/shared/hooks/useActiveChild";
import { useTranslation } from "@/shared/hooks/useTranslation";
import Button from "@/shared/ui/Button/Button";
import Card from "@/shared/ui/Card/Card";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DiaryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { formatDate } = useTranslation();
  const { availableChildren } = useActiveChild();

  const { data: diaryEntryData, isLoading, error } = useDiaryEntry(id!);
  const diaryEntry = diaryEntryData?.diaryEntry;
  const deleteDiaryEntryMutation = useDeleteDiaryEntry();

  const getChildName = (childId: string): string | null => {
    const child = availableChildren.find((c) => c.id === childId);
    return child?.name || null;
  };

  const handleDelete = () => {
    Alert.alert("일기 삭제", "이 일기를 삭제하시겠습니까?", [
      {
        text: "취소",
        style: "cancel",
      },
      {
        text: "삭제",
        style: "destructive",
        onPress: () => {
          deleteDiaryEntryMutation.mutate(id!, {
            onSuccess: () => {
              router.back();
            },
            onError: () => {
              Alert.alert("오류", "일기 삭제에 실패했습니다.");
            },
          });
        },
      },
    ]);
  };

  const handleEdit = () => {
    router.push(`/diary/${id}/edit`);
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <Stack.Screen
          options={{
            title: "일기 상세",
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
            title: "일기 상세",
          }}
        />
        <View className="flex-1 justify-center items-center px-4">
          <Text className="text-base text-destructive text-center mb-4">
            일기를 불러오는데 실패했습니다.
          </Text>
          <Button title="다시 시도" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className="flex-1 bg-background"
      edges={["left", "right", "bottom"]}
    >
      <Stack.Screen
        options={{
          title: "일기",
          headerBackTitle: "목록",
        }}
      />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-4">
          <Card>
            {/* Header with date and child info */}
            <View className="flex-row justify-between items-start mb-6">
              <View className="flex-1 gap-2">
                <Text className="text-lg font-semibold text-foreground mb-1">
                  📅 {formatDate(new Date(diaryEntry.date))}
                </Text>
                {getChildName(diaryEntry.childId) && (
                  <View className="bg-primary px-3 py-1 rounded-full self-start">
                    <Text className="text-white text-sm font-semibold">
                      {getChildName(diaryEntry.childId)}
                    </Text>
                  </View>
                )}
              </View>
              {diaryEntry.user && (
                <View className="items-end">
                  <Text className="text-sm text-text-secondary">
                    작성자: {diaryEntry.user.name || diaryEntry.user.email}
                  </Text>
                </View>
              )}
            </View>

            {/* Content */}
            <View className="mb-6">
              <Text className="text-base text-foreground leading-6">
                {diaryEntry.content}
              </Text>
            </View>

            {/* Photos */}
            {diaryEntry.photos && diaryEntry.photos.length > 0 && (
              <View className="gap-4 mb-6">
                <Text className="text-lg font-semibold text-foreground">
                  📸 사진 ({diaryEntry.photos.length})
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {diaryEntry.photos.map((photo, index) => (
                    <TouchableOpacity
                      key={index}
                      className="rounded-lg overflow-hidden"
                      activeOpacity={0.8}
                    >
                      <Image
                        source={{ uri: photo }}
                        className="w-24 h-24"
                        resizeMode="cover"
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Milestones */}
            {diaryEntry.milestones && diaryEntry.milestones.length > 0 && (
              <View className="gap-4 mb-6">
                <Text className="text-lg font-semibold text-foreground">
                  🏆 마일스톤 ({diaryEntry.milestones.length})
                </Text>
                <View className="gap-4">
                  {diaryEntry.milestones.map((milestone) => (
                    <View
                      key={milestone.id}
                      className="bg-primary/10 p-3 rounded-lg border border-primary/20"
                    >
                      <View className="flex-row items-start justify-between">
                        <View className="flex-1">
                          <Text className="text-base font-semibold text-foreground mb-1">
                            {milestone.description}
                          </Text>
                          <Text className="text-sm text-text-secondary">
                            달성일: {formatDate(new Date(milestone.achievedAt))}
                          </Text>
                        </View>
                        <View className="bg-primary px-2 py-1 rounded">
                          <Text className="text-white text-xs font-semibold">
                            {milestone.type}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Created/Updated timestamps */}
            <View className="pt-4 border-t border-border">
              <Text className="text-xs text-text-secondary">
                생성일: {formatDate(new Date(diaryEntry.createdAt))}
              </Text>
              {diaryEntry.updatedAt !== diaryEntry.createdAt && (
                <Text className="text-xs text-text-secondary mt-1">
                  수정일: {formatDate(new Date(diaryEntry.updatedAt))}
                </Text>
              )}
            </View>
          </Card>
        </View>
      </ScrollView>

      {/* Action buttons */}
      <View className="p-4 gap-3 border-t border-border bg-background">
        <Button title="수정" onPress={handleEdit} variant="outline" />
        <Button
          title="삭제"
          onPress={handleDelete}
          className="bg-destructive"
          disabled={deleteDiaryEntryMutation.isPending}
        />
      </View>
    </SafeAreaView>
  );
}
