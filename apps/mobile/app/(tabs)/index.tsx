import type { ActivityApi } from "@daon/shared";
import { useRouter } from "expo-router";
import {
  Alert,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from "react-native";
import {
  useRecentActivities,
  useTodayActivities,
} from "../../shared/api/hooks/useActivities";
import { useActiveChild } from "../../shared/hooks/useActiveChild";
import Button from "../../shared/ui/Button";
import Card from "../../shared/ui/Card";
import {
  ChildSelector,
  QuickActions,
  RecentActivities,
  TodaySummary,
} from "../../widgets";

export default function HomeScreen() {
  const router = useRouter();

  // Active child 관리
  const {
    activeChildId,
    activeChild,
    isLoading: isActiveChildLoading,
    refetchChildren,
  } = useActiveChild();

  // 오늘의 활동 데이터
  const {
    data: todayData,
    isLoading: isTodayLoading,
    refetch: refetchToday,
  } = useTodayActivities(activeChildId);

  // 최근 활동 데이터
  const {
    data: recentData,
    isLoading: isRecentLoading,
    refetch: refetchRecent,
  } = useRecentActivities(activeChildId);

  const isLoading = isActiveChildLoading || isTodayLoading || isRecentLoading;

  const handleRefresh = async () => {
    try {
      await Promise.all([refetchChildren(), refetchToday(), refetchRecent()]);
    } catch {
      Alert.alert("오류", "데이터를 새로고침하는 중 오류가 발생했습니다.");
    }
  };

  const handleNavigateToRecord = () => {
    router.push("/(tabs)/record");
  };

  const handleNavigateToActivity = (activity: ActivityApi) => {
    router.push(`/activities/${activity.id}`);
  };

  // 활성 아이가 없는 경우
  if (!activeChildId || !activeChild) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <ScrollView className="flex-1 px-4">
          <View className="">
            <Text className="text-2xl font-bold">
              다온에 오신 것을 환영합니다
            </Text>
            <Text className="text-sm text-text-secondary">
              아이의 성장을 기록하기 위해 먼저 아이를 등록해주세요
            </Text>
          </View>

          <Card>
            <View className="items-center justify-center">
              <Text className="text-sm text-text-secondary">
                아직 등록된 아이가 없습니다.{"\n"}첫 번째 아이를 등록해보세요!
              </Text>
              <Button
                title="아이 등록하기"
                onPress={() => router.push("/children/create")}
                variant="primary"
              />
            </View>
          </Card>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-1 px-4"
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* 아이 선택기 */}
        <View className="mb-4">
          <ChildSelector
            onChildChange={() => {
              refetchToday();
              refetchRecent();
            }}
          />
        </View>

        {/* 빠른 기록 */}
        <View className="mb-4">
          <QuickActions
            activeChildId={activeChildId}
            onActivityComplete={() => {
              refetchToday();
              refetchRecent();
            }}
          />
        </View>

        {/* 오늘의 요약 */}
        <View className="mb-4">
          <TodaySummary todayActivities={todayData?.activities || []} />
        </View>

        {/* 최근 활동 */}
        <View className="mb-4">
          <RecentActivities
            activities={recentData?.activities || []}
            onActivityPress={handleNavigateToActivity}
            onViewAllPress={handleNavigateToRecord}
            onFirstActivityPress={handleNavigateToRecord}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
