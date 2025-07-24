import { ActivityCard } from "@/entities/activity/ActivityCard";
import { DiaperBottomSheet } from "@/features/activities/DiaperBottomSheet";
import { FeedingBottomSheet } from "@/features/activities/FeedingBottomSheet";
import { SleepBottomSheet } from "@/features/activities/SleepBottomSheet";
import { useRecentActivities } from "@/shared/api/hooks/useActivities";
import { useActiveChild } from "@/shared/hooks/useActiveChild";
import { useBottomSheetStore } from "@/shared/store/bottomSheetStore";
import { ButtonV2, ButtonText } from "@/shared/ui/Button/ButtonV2";
import Card from "@/shared/ui/Card/Card";
import { type ActivityApi as Activity } from "@daon/shared";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function RecordScreen() {
  const router = useRouter();
  const { activeChild, availableChildren } = useActiveChild();
  const { openBottomSheet, closeBottomSheet } = useBottomSheetStore();

  // null을 전달하여 모든 아이의 활동 가져오기
  const { data: recentActivities, refetch } = useRecentActivities(null);

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch {
      Alert.alert("오류", "데이터를 새로고침하는 중 오류가 발생했습니다.");
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const handleNewRecord = () => {
    router.push("/record/new");
  };

  const handleActivityPress = (activity: Activity) => {
    router.push(`/activities/${activity.id}`);
  };

  const handleActivityComplete = () => {
    refetch();
    closeBottomSheet();
  };

  const handleQuickRecord = (type: string) => {
    if (type === "feeding") {
      openBottomSheet({
        content: <FeedingBottomSheet onComplete={handleActivityComplete} />,
        snapPoints: ["50%", "90%"],
      });
    } else if (type === "diaper") {
      openBottomSheet({
        content: <DiaperBottomSheet onComplete={handleActivityComplete} />,
        snapPoints: ["50%", "90%"],
      });
    } else if (type === "sleep") {
      openBottomSheet({
        content: <SleepBottomSheet onComplete={handleActivityComplete} />,
        snapPoints: ["60%", "95%"],
      });
    } else {
      router.push(`/record/new?type=${type}`);
    }
  };

  console.log("[RecordScreen] recentActivities", recentActivities);

  const activityTypes = [
    { key: "feeding", label: "수유", icon: "🍼" },
    { key: "diaper", label: "기저귀", icon: "👶" },
    { key: "sleep", label: "수면", icon: "😴" },
    { key: "tummy_time", label: "배밀이", icon: "🤸‍♀️" },
  ];

  if (!activeChild) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="mb-4">
          <Text className="text-2xl font-bold">활동 기록</Text>
          <Text className="text-sm text-text-secondary">
            아이를 먼저 등록해주세요
          </Text>
        </View>
        <View className="flex-1 px-4">
          <Card>
            <View className="items-center justify-center">
              <Text className="text-sm text-text-secondary">
                등록된 아이가 없습니다.{"\n"}
                먼저 아이를 등록해주세요.
              </Text>
              <ButtonV2
                onPress={() => router.push("/children/create")}
                variant="default"
              >
                <ButtonText>아이 등록하기</ButtonText>
              </ButtonV2>
            </View>
          </Card>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="p-6">
        <Text className="text-2xl font-bold">활동 기록</Text>
        <Text className="text-sm text-text-secondary">
          아이의 일상을 기록해보세요
        </Text>
      </View>

      <ScrollView
        className="flex-1 p-6"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-6">
          {/* 빠른 기록 */}
          <View className="gap-4">
            <Text className="text-xl font-bold">빠른 기록</Text>
            <View className="flex-row flex-wrap gap-4">
              {activityTypes.map((activity) => (
                <TouchableOpacity
                  key={activity.key}
                  className="flex-1 bg-surface rounded-lg p-4 items-center"
                  onPress={() => handleQuickRecord(activity.key)}
                >
                  <Text className="text-2xl">{activity.icon}</Text>
                  <Text className="text-sm text-text-secondary">
                    {activity.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 최근 활동 */}
          <View className="gap-4">
            <Text className="text-lg font-bold">최근 활동</Text>

            <View>
              {Array.isArray(recentActivities?.activities) &&
              recentActivities.activities.length === 0 ? (
                <Card>
                  <View className="items-center justify-center gap-4">
                    <Text className="text-sm text-text-secondary">
                      아직 기록된 활동이 없습니다.{"\n"}첫 번째 활동을
                      기록해보세요!
                    </Text>
                    <ButtonV2 onPress={handleNewRecord} variant="default">
                      <ButtonText>활동 기록하기</ButtonText>
                    </ButtonV2>
                  </View>
                </Card>
              ) : Array.isArray(recentActivities?.activities) ? (
                recentActivities.activities.map((activity: Activity) => (
                  <ActivityCard
                    key={activity.id}
                    activity={activity}
                    onPress={handleActivityPress}
                    showUser={false}
                    showChild={true}
                    childList={availableChildren}
                  />
                ))
              ) : null}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
