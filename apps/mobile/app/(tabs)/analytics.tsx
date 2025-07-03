import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  type DimensionValue,
} from "react-native";
import { useAnalytics } from "../../shared/api/analytics/hooks";
import { useActiveChildStore } from "../../shared/store";
import { useThemedStyles } from "../../shared/lib/hooks/useTheme";
import Button from "../../shared/ui/Button";

export default function AnalyticsScreen() {
  const router = useRouter();
  const { activeChild } = useActiveChildStore();
  const [selectedPeriod, setSelectedPeriod] = useState<"day" | "week" | "month" | "quarter">("week");

  const analyticsParams = {
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

  const styles = useThemedStyles((theme: import("../../shared/config/theme").Theme) => ({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      padding: theme.spacing.lg,
    },
    header: {
      marginBottom: theme.spacing.xl,
    },
    title: {
      fontSize: theme.typography.title.fontSize,
      fontWeight: theme.typography.title.fontWeight,
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
    },
    subtitle: {
      fontSize: theme.typography.body2.fontSize,
      color: theme.colors.textSecondary,
    },
    periodSelector: {
      flexDirection: "row" as const,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.xs,
      marginBottom: theme.spacing.xl,
    },
    periodButton: {
      flex: 1,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      alignItems: "center" as const,
    },
    periodButtonActive: {
      backgroundColor: theme.colors.primary,
    },
    periodText: {
      fontSize: theme.typography.body2.fontSize,
      color: theme.colors.textSecondary,
      fontWeight: "500" as const,
    },
    periodTextActive: {
      color: theme.colors.white,
      fontWeight: "600" as const,
    },
    summaryGrid: {
      flexDirection: "row" as const,
      flexWrap: "wrap" as const,
      gap: theme.spacing.md,
      marginBottom: theme.spacing.xl,
    },
    summaryCard: {
      flex: 1,
      minWidth: "45%" as DimensionValue,
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.lg,
      borderRadius: theme.borderRadius.lg,
      alignItems: "center" as const,
    },
    summaryValue: {
      fontSize: theme.typography.h3.fontSize,
      fontWeight: theme.typography.h3.fontWeight,
      color: theme.colors.primary,
      marginBottom: theme.spacing.xs,
    },
    summaryLabel: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.textSecondary,
      textAlign: "center" as const,
    },
    sectionGrid: {
      flexDirection: "row" as const,
      flexWrap: "wrap" as const,
      gap: theme.spacing.md,
    },
    sectionCard: {
      flex: 1,
      minWidth: "45%" as DimensionValue,
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.lg,
      borderRadius: theme.borderRadius.lg,
      alignItems: "center" as const,
    },
    sectionIcon: {
      fontSize: 32,
      marginBottom: theme.spacing.sm,
    },
    sectionTitle: {
      fontSize: theme.typography.body1.fontSize,
      fontWeight: "600" as const,
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
    },
    sectionDescription: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.textSecondary,
      textAlign: "center" as const,
    },
    emptyState: {
      alignItems: "center" as const,
      justifyContent: "center" as const,
      padding: theme.spacing.xxl,
    },
    emptyText: {
      fontSize: theme.typography.body1.fontSize,
      color: theme.colors.textSecondary,
      textAlign: "center" as const,
      marginBottom: theme.spacing.lg,
    },
    loadingText: {
      textAlign: "center" as const,
      color: theme.colors.textSecondary,
      padding: theme.spacing.lg,
    },
    errorText: {
      textAlign: "center" as const,
      color: theme.colors.error,
      padding: theme.spacing.lg,
    },
  }));

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
    router.push(route as any);
  };

  if (!activeChild) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen
          options={{
            title: "분석",
          }}
        />
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            아이를 선택해주세요.{"\n"}분석 데이터를 확인하려면 활성 아이가 필요합니다.
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
      <SafeAreaView style={styles.container}>
        <Stack.Screen
          options={{
            title: "분석",
          }}
        />
        <Text style={styles.loadingText}>분석 데이터를 불러오는 중...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen
          options={{
            title: "분석",
          }}
        />
        <View style={styles.emptyState}>
          <Text style={styles.errorText}>
            분석 데이터를 불러오는 중 오류가 발생했습니다.
          </Text>
          <Button title="다시 시도" onPress={() => refetch()} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: "분석",
        }}
      />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
      >
        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={styles.title}>{activeChild.name}의 활동 분석</Text>
          <Text style={styles.subtitle}>
            패턴을 분석하여 더 나은 육아를 도와드립니다
          </Text>
        </View>

        {/* 기간 선택 */}
        <View style={styles.periodSelector}>
          {periods.map((period) => (
            <TouchableOpacity
              key={period.key}
              style={[
                styles.periodButton,
                selectedPeriod === period.key && styles.periodButtonActive,
              ]}
              onPress={() => setSelectedPeriod(period.key)}
            >
              <Text
                style={[
                  styles.periodText,
                  selectedPeriod === period.key && styles.periodTextActive,
                ]}
              >
                {period.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 요약 카드 */}
        {analytics && (
          <View style={styles.summaryGrid}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryValue}>
                {analytics.activitySummary?.totalActivities || 0}
              </Text>
              <Text style={styles.summaryLabel}>총 활동 기록</Text>
            </View>
            
            {analytics.feedingPattern && (
              <View style={styles.summaryCard}>
                <Text style={styles.summaryValue}>
                  {analytics.feedingPattern.totalFeedings}
                </Text>
                <Text style={styles.summaryLabel}>수유 횟수</Text>
              </View>
            )}
            
            {analytics.sleepPattern && (
              <View style={styles.summaryCard}>
                <Text style={styles.summaryValue}>
                  {Math.round(analytics.sleepPattern.averageSleepPerDay / 60)}h
                </Text>
                <Text style={styles.summaryLabel}>평균 수면시간</Text>
              </View>
            )}
            
            {analytics.diaperPattern && (
              <View style={styles.summaryCard}>
                <Text style={styles.summaryValue}>
                  {analytics.diaperPattern.totalChanges}
                </Text>
                <Text style={styles.summaryLabel}>기저귀 교체</Text>
              </View>
            )}
          </View>
        )}

        {/* 섹션 그리드 */}
        <View style={styles.sectionGrid}>
          {sections.map((section) => (
            <TouchableOpacity
              key={section.key}
              style={styles.sectionCard}
              onPress={() => handleSectionPress(section.route)}
              activeOpacity={0.7}
            >
              <Text style={styles.sectionIcon}>{section.icon}</Text>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <Text style={styles.sectionDescription}>
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