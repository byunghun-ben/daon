import type { Theme } from "@/shared/config/theme";
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
import { useDiaperAnalytics } from "../../shared/api/analytics/hooks";
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

export default function DiaperAnalyticsScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>("week");
  const [refreshing, setRefreshing] = useState(false);
  const { activeChild } = useActiveChildStore();

  const styles = useThemedStyles((theme: Theme) => ({
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
    typeDistribution: {
      flexDirection: "row",
      justifyContent: "space-around",
      marginTop: theme.spacing.sm,
    },
    typeItem: {
      alignItems: "center",
    },
    typeLabel: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginBottom: 4,
    },
    typeValue: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.colors.primary,
    },
  }));

  const {
    data: analytics,
    isLoading,
    error,
    refetch,
  } = useDiaperAnalytics(
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
        <Stack.Screen options={{ title: "기저귀 패턴 분석" }} />
        <Text style={styles.errorText}>아이를 선택해주세요</Text>
      </View>
    );
  }

  const diaperPattern = analytics?.diaperPattern;

  // 시간대별 기저귀 교체 차트 데이터
  const hourlyChangeData = {
    labels: ["0-6시", "6-12시", "12-18시", "18-24시"],
    datasets: [
      {
        data: diaperPattern?.changesByHour
          ? [
              diaperPattern.changesByHour
                .filter((h: { hour: number }) => h.hour >= 0 && h.hour < 6)
                .reduce(
                  (sum: number, h: { count: number }) => sum + h.count,
                  0
                ),
              diaperPattern.changesByHour
                .filter((h: { hour: number }) => h.hour >= 6 && h.hour < 12)
                .reduce(
                  (sum: number, h: { count: number }) => sum + h.count,
                  0
                ),
              diaperPattern.changesByHour
                .filter((h: { hour: number }) => h.hour >= 12 && h.hour < 18)
                .reduce(
                  (sum: number, h: { count: number }) => sum + h.count,
                  0
                ),
              diaperPattern.changesByHour
                .filter((h: { hour: number }) => h.hour >= 18 && h.hour < 24)
                .reduce(
                  (sum: number, h: { count: number }) => sum + h.count,
                  0
                ),
            ]
          : [0, 0, 0, 0],
      },
    ],
  };

  // 유형별 기저귀 교체 차트 데이터
  const typeDistributionData = {
    labels: ["소변", "대변", "혼합"],
    datasets: [
      {
        data: [
          diaperPattern?.changeTypes?.wet || 0,
          diaperPattern?.changeTypes?.dirty || 0,
          diaperPattern?.changeTypes?.both || 0,
        ],
      },
    ],
  };

  // 주간 기저귀 교체 추이 차트 데이터
  const weeklyTrendData = {
    labels: ["월", "화", "수", "목", "금", "토", "일"],
    datasets: [
      {
        data: diaperPattern?.changesByDay || [0, 0, 0, 0, 0, 0, 0],
        color: () => "#FF5722",
        strokeWidth: 3,
      },
    ],
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "기저귀 패턴 분석" }} />

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
            {/* 기저귀 교체 통계 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle as TextStyle}>
                기저귀 교체 통계
              </Text>
              <Card style={styles.metricCard}>
                <View style={styles.metricRow as ViewStyle}>
                  <Text style={styles.metricLabel as TextStyle}>
                    총 교체 횟수
                  </Text>
                  <Text style={styles.metricValue as TextStyle}>
                    {diaperPattern?.totalChanges || 0}회
                  </Text>
                </View>
                <View style={styles.metricRow as ViewStyle}>
                  <Text style={styles.metricLabel as TextStyle}>
                    일평균 교체 횟수
                  </Text>
                  <Text style={styles.metricValue as TextStyle}>
                    {diaperPattern?.averageChangesPerDay?.toFixed(1) || 0}회
                  </Text>
                </View>
                <View style={styles.metricRow as ViewStyle}>
                  <Text style={styles.metricLabel as TextStyle}>
                    소변 기저귀
                  </Text>
                  <Text style={styles.metricValue as TextStyle}>
                    {diaperPattern?.changeTypes?.wet || 0}회
                  </Text>
                </View>
                <View style={styles.metricRow as ViewStyle}>
                  <Text style={styles.metricLabel as TextStyle}>
                    대변 기저귀
                  </Text>
                  <Text style={styles.metricValue as TextStyle}>
                    {diaperPattern?.changeTypes?.dirty || 0}회
                  </Text>
                </View>
              </Card>

              {/* 유형별 분포 */}
              <Card>
                <Text
                  style={[
                    styles.metricLabel as TextStyle,
                    { textAlign: "center", marginBottom: 12 },
                  ]}
                >
                  기저귀 유형 분포
                </Text>
                <View style={styles.typeDistribution as ViewStyle}>
                  <View style={styles.typeItem as ViewStyle}>
                    <Text style={styles.typeLabel as TextStyle}>소변</Text>
                    <Text style={styles.typeValue as TextStyle}>
                      {diaperPattern?.changeTypes?.wet || 0}회
                    </Text>
                  </View>
                  <View style={styles.typeItem as ViewStyle}>
                    <Text style={styles.typeLabel as TextStyle}>대변</Text>
                    <Text style={styles.typeValue as TextStyle}>
                      {diaperPattern?.changeTypes?.dirty || 0}회
                    </Text>
                  </View>
                  <View style={styles.typeItem as ViewStyle}>
                    <Text style={styles.typeLabel as TextStyle}>혼합</Text>
                    <Text style={styles.typeValue as TextStyle}>
                      {diaperPattern?.changeTypes?.both || 0}회
                    </Text>
                  </View>
                </View>
              </Card>
            </View>

            {/* 유형별 기저귀 교체 분포 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle as TextStyle}>
                유형별 교체 분포
              </Text>
              <View style={styles.chartContainer}>
                <Text style={styles.chartTitle as TextStyle}>
                  기저귀 유형별 교체 횟수
                </Text>
                <BarChart
                  data={typeDistributionData}
                  height={200}
                  formatYLabel={(value) => `${value}회`}
                />
              </View>
            </View>

            {/* 시간대별 교체 패턴 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle as TextStyle}>
                시간대별 교체 패턴
              </Text>
              <View style={styles.chartContainer}>
                <Text style={styles.chartTitle as TextStyle}>
                  시간대별 교체 횟수
                </Text>
                <BarChart
                  data={hourlyChangeData}
                  height={200}
                  formatYLabel={(value) => `${value}회`}
                />
              </View>
            </View>

            {/* 주간 교체 추이 */}
            {selectedPeriod === "week" && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle as TextStyle}>
                  주간 교체 추이
                </Text>
                <View style={styles.chartContainer}>
                  <Text style={styles.chartTitle as TextStyle}>
                    요일별 교체 횟수
                  </Text>
                  <LineChart
                    data={weeklyTrendData}
                    height={200}
                    formatYLabel={(value) => `${value}회`}
                  />
                </View>
              </View>
            )}

            {/* 교체 간격 분석 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle as TextStyle}>
                교체 간격 분석
              </Text>
              <Card style={styles.metricCard}>
                <View style={styles.metricRow as ViewStyle}>
                  <Text style={styles.metricLabel as TextStyle}>
                    평균 교체 간격
                  </Text>
                  {/* <Text style={styles.metricValue as TextStyle}>
                    {diaperPattern?.averageInterval
                      ? `${Math.round(diaperPattern.averageInterval / 60)}시간 ${diaperPattern.averageInterval % 60}분`
                      : "데이터 없음"}
                  </Text> */}
                </View>
                {/* <View style={styles.metricRow as ViewStyle}>
                  <Text style={styles.metricLabel as TextStyle}>
                    최단 교체 간격
                  </Text>
                  <Text style={styles.metricValue as TextStyle}>
                    {diaperPattern?.shortestInterval
                      ? `${Math.round(diaperPattern.shortestInterval / 60)}시간 ${diaperPattern.shortestInterval % 60}분`
                      : "데이터 없음"}
                  </Text>
                </View>
                <View style={styles.metricRow as ViewStyle}>
                  <Text style={styles.metricLabel as TextStyle}>
                    최장 교체 간격
                  </Text>
                  <Text style={styles.metricValue as TextStyle}>
                    {diaperPattern?.longestInterval
                      ? `${Math.round(diaperPattern.longestInterval / 60)}시간 ${diaperPattern.longestInterval % 60}분`
                      : "데이터 없음"}
                  </Text>
                </View>
                <View style={styles.metricRow as ViewStyle}>
                  <Text style={styles.metricLabel as TextStyle}>
                    밤시간 교체 횟수
                  </Text>
                  <Text style={styles.metricValue as TextStyle}>
                    {diaperPattern?.nightChanges !== undefined
                      ? `${diaperPattern.nightChanges}회`
                      : "데이터 없음"}
                  </Text>
                </View> */}
              </Card>
            </View>

            {/* 대변 패턴 분석 */}
            {/* <View style={styles.section}>
              <Text style={styles.sectionTitle as TextStyle}>
                대변 패턴 분석
              </Text>
              <Card style={styles.metricCard}>
                <View style={styles.metricRow as ViewStyle}>
                  <Text style={styles.metricLabel as TextStyle}>
                    일평균 대변 횟수
                  </Text>
                  <Text style={styles.metricValue as TextStyle}>
                    {diaperPattern?.averageDirtyDiapersPerDay?.toFixed(1) || 0}
                    회
                  </Text>
                </View>
                <View style={styles.metricRow as ViewStyle}>
                  <Text style={styles.metricLabel as TextStyle}>
                    대변 간격 평균
                  </Text>
                  <Text style={styles.metricValue as TextStyle}>
                    {diaperPattern?.averageDirtyInterval
                      ? `${Math.round(diaperPattern.averageDirtyInterval / 60)}시간 ${diaperPattern.averageDirtyInterval % 60}분`
                      : "데이터 없음"}
                  </Text>
                </View>
                <View style={styles.metricRow as ViewStyle}>
                  <Text style={styles.metricLabel as TextStyle}>
                    최장 대변 간격
                  </Text>
                  <Text style={styles.metricValue as TextStyle}>
                    {diaperPattern?.longestDirtyInterval
                      ? `${Math.round(diaperPattern.longestDirtyInterval / 60)}시간 ${diaperPattern.longestDirtyInterval % 60}분`
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
