import { Stack } from "expo-router";
import { useState } from "react";
import type { TextStyle, ViewStyle } from "react-native";
import {
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFeedingAnalytics } from "../../shared/api/analytics/hooks";
import { useThemedStyles } from "../../shared/lib/hooks/useTheme";
import { useActiveChildStore } from "../../shared/store";
import Card from "../../shared/ui/Card";
import { BarChart, LineChart } from "../../shared/ui/charts";

type TimePeriod = "day" | "week" | "month";

const timePeriods = [
  { key: "day" as const, label: "일간" },
  { key: "week" as const, label: "주간" },
  { key: "month" as const, label: "월간" },
];

export default function FeedingAnalyticsScreen() {
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
  } = useFeedingAnalytics(
    {
      childId: activeChild?.id || "",
      period: {
        startDate: new Date(
          Date.now() - getPeriodDays(selectedPeriod) * 24 * 60 * 60 * 1000
        )
          .toISOString()
          .split("T")[0],
        endDate: new Date().toISOString().split("T")[0],
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

  if (!activeChild) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: "수유 패턴 분석" }} />
        <Text style={styles.errorText}>아이를 선택해주세요</Text>
      </View>
    );
  }

  const feedingPattern = analytics?.feedingPattern;

  // 시간대별 수유 차트 데이터
  const hourlyFeedingData = {
    labels: ["0-6시", "6-12시", "12-18시", "18-24시"],
    datasets: [
      {
        data: feedingPattern?.feedingsByHour
          ? [
              feedingPattern.feedingsByHour
                .filter((h) => h.hour >= 0 && h.hour < 6)
                .reduce((sum, h) => sum + h.count, 0),
              feedingPattern.feedingsByHour
                .filter((h) => h.hour >= 6 && h.hour < 12)
                .reduce((sum, h) => sum + h.count, 0),
              feedingPattern.feedingsByHour
                .filter((h) => h.hour >= 12 && h.hour < 18)
                .reduce((sum, h) => sum + h.count, 0),
              feedingPattern.feedingsByHour
                .filter((h) => h.hour >= 18 && h.hour < 24)
                .reduce((sum, h) => sum + h.count, 0),
            ]
          : [0, 0, 0, 0],
      },
    ],
  };

  // 주간 수유 추이 차트 데이터
  const weeklyTrendData = {
    labels: ["월", "화", "수", "목", "금", "토", "일"],
    datasets: [
      {
        data: feedingPattern?.feedingsByDay || [0, 0, 0, 0, 0, 0, 0],
        color: () => "#4CAF50",
        strokeWidth: 3,
      },
    ],
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "수유 패턴 분석" }} />

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* 기간 선택 */}
        <View style={styles.periodSelector as ViewStyle}>
          {timePeriods.map((period) => (
            <TouchableOpacity
              key={period.key}
              style={
                [
                  styles.periodButton,
                  selectedPeriod === period.key && styles.periodButtonActive,
                ] as ViewStyle[]
              }
              onPress={() => setSelectedPeriod(period.key)}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  selectedPeriod === period.key &&
                    styles.periodButtonTextActive,
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
            {/* 수유 통계 요약 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle as TextStyle}>수유 통계</Text>
              <Card style={styles.metricCard}>
                <View style={styles.metricRow as ViewStyle}>
                  <Text style={styles.metricLabel as TextStyle}>
                    총 수유 횟수
                  </Text>
                  <Text style={styles.metricValue as TextStyle}>
                    {feedingPattern?.totalFeedings || 0}회
                  </Text>
                </View>
                <View style={styles.metricRow as ViewStyle}>
                  <Text style={styles.metricLabel as TextStyle}>
                    일평균 수유 횟수
                  </Text>
                  <Text style={styles.metricValue as TextStyle}>
                    {feedingPattern?.averageFeedingsPerDay?.toFixed(1) || 0}회
                  </Text>
                </View>
                {feedingPattern?.totalVolume && (
                  <View style={styles.metricRow as ViewStyle}>
                    <Text style={styles.metricLabel as TextStyle}>
                      총 수유량
                    </Text>
                    <Text style={styles.metricValue as TextStyle}>
                      {feedingPattern.totalVolume}ml
                    </Text>
                  </View>
                )}
                {feedingPattern?.averageVolumePerFeeding && (
                  <View style={styles.metricRow as ViewStyle}>
                    <Text style={styles.metricLabel as TextStyle}>
                      회당 평균 수유량
                    </Text>
                    <Text style={styles.metricValue as TextStyle}>
                      {feedingPattern.averageVolumePerFeeding}ml
                    </Text>
                  </View>
                )}
              </Card>
            </View>

            {/* 시간대별 수유 패턴 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle as TextStyle}>
                시간대별 수유 패턴
              </Text>
              <View style={styles.chartContainer}>
                <Text style={styles.chartTitle as TextStyle}>
                  시간대별 수유 횟수
                </Text>
                <BarChart
                  data={hourlyFeedingData}
                  height={200}
                  formatYLabel={(value) => `${value}회`}
                />
              </View>
            </View>

            {/* 주간 수유 추이 */}
            {selectedPeriod === "week" && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle as TextStyle}>
                  주간 수유 추이
                </Text>
                <View style={styles.chartContainer}>
                  <Text style={styles.chartTitle as TextStyle}>
                    요일별 수유 횟수
                  </Text>
                  <LineChart
                    data={weeklyTrendData}
                    height={200}
                    formatYLabel={(value) => `${value}회`}
                  />
                </View>
              </View>
            )}

            {/* 수유 간격 분석 */}
            {/* <View style={styles.section}>
              <Text style={styles.sectionTitle as TextStyle}>
                수유 간격 분석
              </Text>
              <Card style={styles.metricCard}>
                <View style={styles.metricRow as ViewStyle}>
                  <Text style={styles.metricLabel as TextStyle}>
                    평균 수유 간격
                  </Text>
                  <Text style={styles.metricValue as TextStyle}>
                    {feedingPattern?.averageInterval
                      ? `${Math.round(feedingPattern.averageInterval / 60)}시간 ${feedingPattern.averageInterval % 60}분`
                      : "데이터 없음"}
                  </Text>
                </View>
                <View style={styles.metricRow as ViewStyle}>
                  <Text style={styles.metricLabel as TextStyle}>
                    최단 수유 간격
                  </Text>
                  <Text style={styles.metricValue as TextStyle}>
                    {feedingPattern?.shortestInterval
                      ? `${Math.round(feedingPattern.shortestInterval / 60)}시간 ${feedingPattern.shortestInterval % 60}분`
                      : "데이터 없음"}
                  </Text>
                </View>
                <View style={styles.metricRow as ViewStyle}>
                  <Text style={styles.metricLabel as TextStyle}>
                    최장 수유 간격
                  </Text>
                  <Text style={styles.metricValue as TextStyle}>
                    {feedingPattern?.longestInterval
                      ? `${Math.round(feedingPattern.longestInterval / 60)}시간 ${feedingPattern.longestInterval % 60}분`
                      : "데이터 없음"}
                  </Text>
                </View>
              </Card>
            </View> */}
          </>
        )}
      </ScrollView>
    </View>
  );
}
