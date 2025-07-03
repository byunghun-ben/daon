import React, { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { Stack } from "expo-router";
import { LineChart, BarChart } from "../../shared/ui/charts";
import Card from "../../shared/ui/Card";
import { useThemedStyles } from "../../shared/lib/hooks/useTheme";
import { useActiveChildStore } from "../../shared/store";
import { useGrowthAnalytics } from "../../shared/api/analytics/hooks";

type TimePeriod = "month" | "quarter" | "year";

const timePeriods = [
  { key: "month" as const, label: "월간" },
  { key: "quarter" as const, label: "분기" },
  { key: "year" as const, label: "연간" },
];

export default function GrowthAnalyticsScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>("quarter");
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
    percentileInfo: {
      flexDirection: "row",
      justifyContent: "space-around",
      marginTop: theme.spacing.sm,
    },
    percentileItem: {
      alignItems: "center",
    },
    percentileLabel: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginBottom: 4,
    },
    percentileValue: {
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
  } = useGrowthAnalytics(
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
      case "month":
        return 30;
      case "quarter":
        return 90;
      case "year":
        return 365;
      default:
        return 90;
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
        <Stack.Screen options={{ title: "성장 추세 분석" }} />
        <Text style={styles.errorText}>아이를 선택해주세요</Text>
      </View>
    );
  }

  const growthPattern = analytics?.growthPattern;

  // 신장 추이 차트 데이터
  const heightTrendData = {
    labels: growthPattern?.heightTrend?.map((_, index) => `${index + 1}월`) || [],
    datasets: [
      {
        data: growthPattern?.heightTrend?.map(point => point.value) || [],
        color: () => "#FF9800",
        strokeWidth: 3,
      },
    ],
  };

  // 체중 추이 차트 데이터
  const weightTrendData = {
    labels: growthPattern?.weightTrend?.map((_, index) => `${index + 1}월`) || [],
    datasets: [
      {
        data: growthPattern?.weightTrend?.map(point => point.value) || [],
        color: () => "#4CAF50",
        strokeWidth: 3,
      },
    ],
  };

  // 두위 추이 차트 데이터
  const headCircumferenceTrendData = {
    labels: growthPattern?.headCircumferenceTrend?.map((_, index) => `${index + 1}월`) || [],
    datasets: [
      {
        data: growthPattern?.headCircumferenceTrend?.map(point => point.value) || [],
        color: () => "#9C27B0",
        strokeWidth: 3,
      },
    ],
  };

  // 성장률 비교 차트 데이터
  const growthRateData = {
    labels: ["신장", "체중", "두위"],
    datasets: [
      {
        data: [
          growthPattern?.heightGrowthRate || 0,
          growthPattern?.weightGrowthRate || 0,
          growthPattern?.headCircumferenceGrowthRate || 0,
        ],
      },
    ],
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "성장 추세 분석" }} />
      
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
            {/* 현재 성장 상태 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>현재 성장 상태</Text>
              <Card style={styles.metricCard}>
                <View style={styles.metricRow}>
                  <Text style={styles.metricLabel}>현재 신장</Text>
                  <Text style={styles.metricValue}>
                    {growthPattern?.currentHeight ? `${growthPattern.currentHeight}cm` : "데이터 없음"}
                  </Text>
                </View>
                <View style={styles.metricRow}>
                  <Text style={styles.metricLabel}>현재 체중</Text>
                  <Text style={styles.metricValue}>
                    {growthPattern?.currentWeight ? `${growthPattern.currentWeight}kg` : "데이터 없음"}
                  </Text>
                </View>
                <View style={styles.metricRow}>
                  <Text style={styles.metricLabel}>현재 두위</Text>
                  <Text style={styles.metricValue}>
                    {growthPattern?.currentHeadCircumference ? `${growthPattern.currentHeadCircumference}cm` : "데이터 없음"}
                  </Text>
                </View>
              </Card>

              {/* 백분위 정보 */}
              <Card>
                <Text style={[styles.metricLabel, { textAlign: "center" as const, marginBottom: 12 }]}>
                  성장 백분위
                </Text>
                <View style={styles.percentileInfo}>
                  <View style={styles.percentileItem}>
                    <Text style={styles.percentileLabel}>신장</Text>
                    <Text style={styles.percentileValue}>
                      {growthPattern?.heightPercentile ? `${growthPattern.heightPercentile}%` : "-"}
                    </Text>
                  </View>
                  <View style={styles.percentileItem}>
                    <Text style={styles.percentileLabel}>체중</Text>
                    <Text style={styles.percentileValue}>
                      {growthPattern?.weightPercentile ? `${growthPattern.weightPercentile}%` : "-"}
                    </Text>
                  </View>
                  <View style={styles.percentileItem}>
                    <Text style={styles.percentileLabel}>두위</Text>
                    <Text style={styles.percentileValue}>
                      {growthPattern?.headCircumferencePercentile ? `${growthPattern.headCircumferencePercentile}%` : "-"}
                    </Text>
                  </View>
                </View>
              </Card>
            </View>

            {/* 성장률 비교 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>성장률 비교</Text>
              <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>월별 성장률 (%)</Text>
                <BarChart
                  data={growthRateData}
                  height={200}
                  formatYLabel={(value) => `${value}%`}
                />
              </View>
            </View>

            {/* 신장 추이 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>신장 추이</Text>
              <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>신장 변화 (cm)</Text>
                <LineChart
                  data={heightTrendData}
                  height={200}
                  formatYLabel={(value) => `${value}cm`}
                />
              </View>
            </View>

            {/* 체중 추이 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>체중 추이</Text>
              <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>체중 변화 (kg)</Text>
                <LineChart
                  data={weightTrendData}
                  height={200}
                  formatYLabel={(value) => `${value}kg`}
                />
              </View>
            </View>

            {/* 두위 추이 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>두위 추이</Text>
              <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>두위 변화 (cm)</Text>
                <LineChart
                  data={headCircumferenceTrendData}
                  height={200}
                  formatYLabel={(value) => `${value}cm`}
                />
              </View>
            </View>

            {/* 성장 분석 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>성장 분석</Text>
              <Card style={styles.metricCard}>
                <View style={styles.metricRow}>
                  <Text style={styles.metricLabel}>신장 성장률</Text>
                  <Text style={styles.metricValue}>
                    {growthPattern?.heightGrowthRate ? `${growthPattern.heightGrowthRate.toFixed(1)}%` : "데이터 없음"}
                  </Text>
                </View>
                <View style={styles.metricRow}>
                  <Text style={styles.metricLabel}>체중 성장률</Text>
                  <Text style={styles.metricValue}>
                    {growthPattern?.weightGrowthRate ? `${growthPattern.weightGrowthRate.toFixed(1)}%` : "데이터 없음"}
                  </Text>
                </View>
                <View style={styles.metricRow}>
                  <Text style={styles.metricLabel}>두위 성장률</Text>
                  <Text style={styles.metricValue}>
                    {growthPattern?.headCircumferenceGrowthRate ? `${growthPattern.headCircumferenceGrowthRate.toFixed(1)}%` : "데이터 없음"}
                  </Text>
                </View>
                <View style={styles.metricRow}>
                  <Text style={styles.metricLabel}>평균 월간 신장 증가</Text>
                  <Text style={styles.metricValue}>
                    {growthPattern?.averageMonthlyHeightGain ? `${growthPattern.averageMonthlyHeightGain.toFixed(1)}cm` : "데이터 없음"}
                  </Text>
                </View>
                <View style={styles.metricRow}>
                  <Text style={styles.metricLabel}>평균 월간 체중 증가</Text>
                  <Text style={styles.metricValue}>
                    {growthPattern?.averageMonthlyWeightGain ? `${growthPattern.averageMonthlyWeightGain.toFixed(1)}kg` : "데이터 없음"}
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