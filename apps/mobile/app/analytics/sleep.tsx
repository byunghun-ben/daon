import React, { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { Stack } from "expo-router";
import { BarChart, LineChart } from "../../shared/ui/charts";
import Card from "../../shared/ui/Card";
import { useThemedStyles } from "../../shared/lib/hooks/useTheme";
import { useActiveChildStore } from "../../shared/store";
import { useSleepAnalytics } from "../../shared/api/analytics/hooks";

type TimePeriod = "day" | "week" | "month";

const timePeriods = [
  { key: "day" as const, label: "일간" },
  { key: "week" as const, label: "주간" },
  { key: "month" as const, label: "월간" },
];

export default function SleepAnalyticsScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>("week");
  const [refreshing, setRefreshing] = useState(false);
  const { activeChild } = useActiveChildStore();

  const styles = useThemedStyles((theme) => ({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      padding: theme.spacing.md,
    },
    periodSelector: {
      flexDirection: "row",
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 4,
      marginBottom: theme.spacing.lg,
    },
    periodButton: {
      flex: 1,
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 8,
      alignItems: "center",
    },
    periodButtonActive: {
      backgroundColor: theme.colors.primary,
    },
    periodButtonText: {
      fontSize: 14,
      fontWeight: "500",
      color: theme.colors.text,
    },
    periodButtonTextActive: {
      color: theme.colors.onPrimary,
    },
    section: {
      marginBottom: theme.spacing.lg,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
    },
    metricCard: {
      marginBottom: theme.spacing.md,
    },
    metricRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 8,
    },
    metricLabel: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    metricValue: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.text,
    },
    chartContainer: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.md,
    },
    chartTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
      textAlign: "center" as const,
    },
    loadingText: {
      textAlign: "center" as const,
      fontSize: 16,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.xl,
    },
    errorText: {
      textAlign: "center" as const,
      fontSize: 16,
      color: theme.colors.error,
      marginTop: theme.spacing.xl,
    },
  }));

  const {
    data: analytics,
    isLoading,
    error,
    refetch,
  } = useSleepAnalytics(
    {
      childId: activeChild?.id || "",
      period: {
        startDate: new Date(Date.now() - getPeriodDays(selectedPeriod) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        period: selectedPeriod,
      },
    },
    { enabled: !!activeChild?.id }
  );

  function getPeriodDays(period: TimePeriod): number {
    switch (period) {
      case "day":
        return 1;
      case "week":
        return 7;
      case "month":
        return 30;
      default:
        return 7;
    }
  }

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  function formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}시간 ${mins}분`;
  }

  if (!activeChild) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: "수면 패턴 분석" }} />
        <Text style={styles.errorText}>아이를 선택해주세요</Text>
      </View>
    );
  }

  const sleepPattern = analytics?.sleepPattern;

  // 주간 수면 시간 차트 데이터
  const weeklyTrendData = {
    labels: ["월", "화", "수", "목", "금", "토", "일"],
    datasets: [
      {
        data: sleepPattern?.sleepByDay?.map(day => day.totalMinutes / 60) || [0, 0, 0, 0, 0, 0, 0],
        color: () => "#2196F3",
        strokeWidth: 3,
      },
    ],
  };

  // 낮잠 vs 밤잠 비교 차트 데이터
  const napVsNightData = {
    labels: ["낮잠", "밤잠"],
    datasets: [
      {
        data: [
          sleepPattern?.totalNapTime ? sleepPattern.totalNapTime / 60 : 0,
          sleepPattern?.totalNightSleep ? sleepPattern.totalNightSleep / 60 : 0,
        ],
      },
    ],
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "수면 패턴 분석" }} />
      
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* 기간 선택 */}
        <View style={styles.periodSelector}>
          {timePeriods.map((period) => (
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
                  styles.periodButtonText,
                  selectedPeriod === period.key && styles.periodButtonTextActive,
                ]}
              >
                {period.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {isLoading ? (
          <Text style={styles.loadingText}>분석 데이터를 불러오는 중...</Text>
        ) : error ? (
          <Text style={styles.errorText}>
            데이터를 불러오는 중 오류가 발생했습니다
          </Text>
        ) : (
          <>
            {/* 수면 통계 요약 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>수면 통계</Text>
              <Card style={styles.metricCard}>
                <View style={styles.metricRow}>
                  <Text style={styles.metricLabel}>총 수면 시간</Text>
                  <Text style={styles.metricValue}>
                    {sleepPattern?.totalSleepTime ? formatDuration(sleepPattern.totalSleepTime) : "데이터 없음"}
                  </Text>
                </View>
                <View style={styles.metricRow}>
                  <Text style={styles.metricLabel}>일평균 수면 시간</Text>
                  <Text style={styles.metricValue}>
                    {sleepPattern?.averageSleepPerDay ? formatDuration(sleepPattern.averageSleepPerDay) : "데이터 없음"}
                  </Text>
                </View>
                <View style={styles.metricRow}>
                  <Text style={styles.metricLabel}>총 낮잠 시간</Text>
                  <Text style={styles.metricValue}>
                    {sleepPattern?.totalNapTime ? formatDuration(sleepPattern.totalNapTime) : "데이터 없음"}
                  </Text>
                </View>
                <View style={styles.metricRow}>
                  <Text style={styles.metricLabel}>총 밤잠 시간</Text>
                  <Text style={styles.metricValue}>
                    {sleepPattern?.totalNightSleep ? formatDuration(sleepPattern.totalNightSleep) : "데이터 없음"}
                  </Text>
                </View>
              </Card>
            </View>

            {/* 낮잠 vs 밤잠 비교 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>낮잠 vs 밤잠 비교</Text>
              <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>수면 시간 분포 (시간)</Text>
                <BarChart
                  data={napVsNightData}
                  height={200}
                  formatYLabel={(value) => `${value}시간`}
                />
              </View>
            </View>

            {/* 주간 수면 추이 */}
            {selectedPeriod === "week" && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>주간 수면 추이</Text>
                <View style={styles.chartContainer}>
                  <Text style={styles.chartTitle}>요일별 수면 시간 (시간)</Text>
                  <LineChart
                    data={weeklyTrendData}
                    height={200}
                    formatYLabel={(value) => `${value}시간`}
                  />
                </View>
              </View>
            )}

            {/* 수면 패턴 분석 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>수면 패턴 분석</Text>
              <Card style={styles.metricCard}>
                <View style={styles.metricRow}>
                  <Text style={styles.metricLabel}>평균 취침 시간</Text>
                  <Text style={styles.metricValue}>
                    {sleepPattern?.averageBedtime || "데이터 없음"}
                  </Text>
                </View>
                <View style={styles.metricRow}>
                  <Text style={styles.metricLabel}>평균 기상 시간</Text>
                  <Text style={styles.metricValue}>
                    {sleepPattern?.averageWakeTime || "데이터 없음"}
                  </Text>
                </View>
                <View style={styles.metricRow}>
                  <Text style={styles.metricLabel}>낮잠 횟수</Text>
                  <Text style={styles.metricValue}>
                    {sleepPattern?.napCount ? `${sleepPattern.napCount}회` : "데이터 없음"}
                  </Text>
                </View>
                <View style={styles.metricRow}>
                  <Text style={styles.metricLabel}>평균 낮잠 시간</Text>
                  <Text style={styles.metricValue}>
                    {sleepPattern?.averageNapDuration ? formatDuration(sleepPattern.averageNapDuration) : "데이터 없음"}
                  </Text>
                </View>
              </Card>
            </View>

            {/* 수면 효율성 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>수면 효율성</Text>
              <Card style={styles.metricCard}>
                <View style={styles.metricRow}>
                  <Text style={styles.metricLabel}>수면 효율성</Text>
                  <Text style={styles.metricValue}>
                    {sleepPattern?.sleepEfficiency ? `${sleepPattern.sleepEfficiency.toFixed(1)}%` : "데이터 없음"}
                  </Text>
                </View>
                <View style={styles.metricRow}>
                  <Text style={styles.metricLabel}>수면 세션 수</Text>
                  <Text style={styles.metricValue}>
                    {sleepPattern?.sleepSessions !== undefined ? `${sleepPattern.sleepSessions}회` : "데이터 없음"}
                  </Text>
                </View>
                <View style={styles.metricRow}>
                  <Text style={styles.metricLabel}>최장 연속 수면</Text>
                  <Text style={styles.metricValue}>
                    {sleepPattern?.longestSleep ? formatDuration(sleepPattern.longestSleep) : "데이터 없음"}
                  </Text>
                </View>
              </Card>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}