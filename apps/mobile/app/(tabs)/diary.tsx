import { DiaryEntryCard } from "@/entities/diary-entry/DiaryEntryCard";
import { useDiaryEntries } from "@/shared/api/diary/hooks/useDiaryEntries";
import { useActiveChild } from "@/shared/hooks/useActiveChild";
import Button from "@/shared/ui/Button/Button";
import Card from "@/shared/ui/Card/Card";
import type { DiaryEntryApi } from "@daon/shared";
import { useRouter } from "expo-router";
import {
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from "react-native";

export default function DiaryScreen() {
  const router = useRouter();
  const { availableChildren } = useActiveChild();

  // 모든 접근 가능한 아이의 일기 가져오기 (childId 필터 제거)
  const {
    data: diaryData,
    isLoading,
    isError,
    error: diaryError,
    refetch,
  } = useDiaryEntries({ limit: 20, offset: 0 });

  if (!availableChildren || availableChildren.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="p-4 pb-4">
          <Text className="text-2xl font-bold text-foreground mb-2">
            성장 일기
          </Text>
          <Text className="text-sm text-muted-foreground">
            아이를 먼저 등록해주세요
          </Text>
        </View>
        <View className="flex-1 p-4">
          <Card>
            <View className="items-center justify-center p-8">
              <Text className="text-base text-muted-foreground text-center mb-6">
                등록된 아이가 없습니다.{"\n"}
                먼저 아이를 등록해주세요.
              </Text>
              <Button
                title="아이 등록하기"
                onPress={() => router.push("/children/create")}
                variant="primary"
              />
            </View>
          </Card>
        </View>
      </SafeAreaView>
    );
  }

  const renderDiaryItem = (diaryEntry: DiaryEntryApi) => (
    <DiaryEntryCard
      key={diaryEntry.id}
      diaryEntry={diaryEntry}
      onPress={(entry) => router.push(`/diary/${entry.id}`)}
      showUser={false}
      showChild={availableChildren.length > 1}
      childList={availableChildren}
      maxContentLength={100}
    />
  );

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="p-4 pb-4">
          <Text className="text-2xl font-bold text-foreground mb-2">
            성장 일기
          </Text>
          <Text className="text-sm text-muted-foreground">
            소중한 순간들을 기록해보세요
          </Text>
        </View>
        <Text className="text-center text-muted-foreground p-6">
          일기를 불러오는 중...
        </Text>
      </SafeAreaView>
    );
  }

  if (isError) {
    console.error("[DiaryScreen] isError", diaryError);
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="p-4 pb-4">
          <Text className="text-2xl font-bold text-foreground mb-2">
            성장 일기
          </Text>
          <Text className="text-sm text-muted-foreground">
            소중한 순간들을 기록해보세요
          </Text>
        </View>
        <Text className="text-center text-destructive p-6">
          일기를 불러오는 중 오류가 발생했습니다.
        </Text>
        <Button title="다시 시도" onPress={() => refetch()} variant="primary" />
      </SafeAreaView>
    );
  }

  const diaryEntries = diaryData?.diaryEntries || [];

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="p-4 pb-4">
        <Text className="text-2xl font-bold text-foreground mb-2">
          성장 일기
        </Text>
        <Text className="text-sm text-muted-foreground">
          {availableChildren.length === 1
            ? `${availableChildren[0].name}의 소중한 순간들을 기록해보세요`
            : "소중한 순간들을 기록해보세요"}
        </Text>
      </View>

      {diaryEntries.length === 0 ? (
        <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
          <Card>
            <View className="items-center justify-center p-8">
              <Text className="text-base text-muted-foreground text-center mb-6">
                아직 작성된 일기가 없습니다.{"\n"}첫 번째 일기를 작성해보세요!
              </Text>
              <Button
                title="일기 작성하기"
                onPress={() => router.push("/diary/new")}
                variant="primary"
              />
            </View>
          </Card>
        </ScrollView>
      ) : (
        <ScrollView
          className="flex-1 p-4"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={refetch} />
          }
        >
          {diaryEntries.map(renderDiaryItem)}

          <View className="mt-4">
            <Button
              title="새 일기 작성"
              onPress={() => router.push("/diary/new")}
              variant="primary"
            />
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
