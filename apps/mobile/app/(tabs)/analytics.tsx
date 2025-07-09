import { useAnalytics } from "@/shared/api/analytics/hooks";
import { useActiveChildStore } from "@/shared/store/activeChildStore";
import Button from "@/shared/ui/Button/Button";
import type { AnalyticsRequest } from "@daon/shared";
import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import {
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function AnalyticsScreen() {
  const router = useRouter();
  const { activeChild } = useActiveChildStore();
  const [selectedPeriod, setSelectedPeriod] = useState<
    "day" | "week" | "month" | "quarter"
  >("week");

  const analyticsParams: AnalyticsRequest = {
    childId: activeChild?.id || "",
    period: {
      startDate: getStartDate(selectedPeriod),
      endDate: getCurrentDate(),
      period: selectedPeriod,
    },
    includePatterns: ["feeding", "sleep", "diaper", "growth", "activity"],
  };

  const {
    data: analytics,
    isLoading,
    error,
    refetch,
  } = useAnalytics(analyticsParams, {
    enabled: !!activeChild?.id,
  });

  const periods = [
    { key: "day" as const, label: "일간" },
    { key: "week" as const, label: "주간" },
    { key: "month" as const, label: "월간" },
    { key: "quarter" as const, label: "분기" },
  ];

  const sections = [
    {
      key: "feeding",
      title: "수유 패턴",
      icon: "🍼",
      description: "수유 빈도, 양, 시간대 분석",
      route: "/analytics/feeding",
    },
    {
      key: "sleep",
      title: "수면 패턴",
      icon: "😴",
      description: "수면 시간, 품질, 리듬 분석",
      route: "/analytics/sleep",
    },
    {
      key: "growth",
      title: "성장 추이",
      icon: "📏",
      description: "키, 체중, 성장 곡선 분석",
      route: "/analytics/growth",
    },
    {
      key: "diaper",
      title: "기저귀 패턴",
      icon: "👶",
      description: "교체 빈도, 시간대 분석",
      route: "/analytics/diaper",
    },
  ];

  const handleSectionPress = (route: string) => {
    router.push(route);
  };

  if (!activeChild) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <Stack.Screen
          options={{
            title: "분석",
          }}
        />
        <View className="items-center justify-center">
          <Text className="text-sm text-text-secondary">
            아이를 선택해주세요.{"\n"}분석 데이터를 확인하려면 활성 아이가
            필요합니다.
          </Text>
          <Button
            title="아이 선택"
            onPress={() => router.push("/children/list")}
            variant="primary"
          />
        </View>
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <Stack.Screen
          options={{
            title: "분석",
          }}
        />
        <Text className="text-sm text-text-secondary">
          분석 데이터를 불러오는 중...
        </Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <Stack.Screen
          options={{
            title: "분석",
          }}
        />
        <View className="items-center justify-center">
          <Text className="text-sm text-text-secondary">
            분석 데이터를 불러오는 중 오류가 발생했습니다.
          </Text>
          <Button title="다시 시도" onPress={() => refetch()} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <Stack.Screen
        options={{
          title: "분석",
        }}
      />

      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
      >
        {/* 헤더 */}
        <View className="mb-4">
          <Text className="text-2xl font-bold">
            {activeChild.name}의 활동 분석
          </Text>
          <Text className="text-sm text-text-secondary">
            패턴을 분석하여 더 나은 육아를 도와드립니다
          </Text>
        </View>

        {/* 기간 선택 */}
        <View className="mb-4">
          {periods.map((period) => (
            <TouchableOpacity
              key={period.key}
              className={`flex-1 p-2 rounded-lg ${
                selectedPeriod === period.key ? "bg-primary" : "bg-background"
              }`}
              onPress={() => setSelectedPeriod(period.key)}
            >
              <Text
                className={`text-sm ${
                  selectedPeriod === period.key
                    ? "text-white"
                    : "text-text-secondary"
                }`}
              >
                {period.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 요약 카드 */}
        {analytics && (
          <View className="flex-row flex-wrap gap-4 mb-4">
            <View className="flex-1 bg-surface rounded-lg p-4 items-center">
              <Text className="text-2xl font-bold">
                {analytics.activitySummary?.totalActivities || 0}
              </Text>
              <Text className="text-sm text-text-secondary">총 활동 기록</Text>
            </View>

            {analytics.feedingPattern && (
              <View className="flex-1 bg-surface rounded-lg p-4 items-center">
                <Text className="text-2xl font-bold">
                  {analytics.feedingPattern.totalFeedings}
                </Text>
                <Text className="text-sm text-text-secondary">수유 횟수</Text>
              </View>
            )}

            {analytics.sleepPattern && (
              <View className="flex-1 bg-surface rounded-lg p-4 items-center">
                <Text className="text-2xl font-bold">
                  {Math.round(analytics.sleepPattern.averageSleepPerDay / 60)}h
                </Text>
                <Text className="text-sm text-text-secondary">
                  평균 수면시간
                </Text>
              </View>
            )}

            {analytics.diaperPattern && (
              <View className="flex-1 bg-surface rounded-lg p-4 items-center">
                <Text className="text-2xl font-bold">
                  {analytics.diaperPattern.totalChanges}
                </Text>
                <Text className="text-sm text-text-secondary">기저귀 교체</Text>
              </View>
            )}
          </View>
        )}

        {/* 섹션 그리드 */}
        <View className="flex-row flex-wrap gap-4 mb-4">
          {sections.map((section) => (
            <TouchableOpacity
              key={section.key}
              className="flex-1 bg-surface rounded-lg p-4 items-center"
              onPress={() => handleSectionPress(section.route)}
              activeOpacity={0.7}
            >
              <Text className="text-2xl">{section.icon}</Text>
              <Text className="text-lg font-bold">{section.title}</Text>
              <Text className="text-sm text-text-secondary">
                {section.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// 유틸리티 함수들
function getCurrentDate(): string {
  return new Date().toISOString().split("T")[0];
}

function getStartDate(period: "day" | "week" | "month" | "quarter"): string {
  const now = new Date();
  const date = new Date(now);

  switch (period) {
    case "day":
      return date.toISOString().split("T")[0];
    case "week":
      date.setDate(date.getDate() - 7);
      break;
    case "month":
      date.setMonth(date.getMonth() - 1);
      break;
    case "quarter":
      date.setMonth(date.getMonth() - 3);
      break;
  }

  return date.toISOString().split("T")[0];
}
