import type { GrowthRecordApi } from "@daon/shared";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { GrowthRecordCard } from "../../entities";
import { useGrowthRecords } from "../../shared/api/growth/hooks";
import { SCREEN_PADDING } from "../../shared/config/theme";
import { useActiveChild } from "../../shared/hooks/useActiveChild";
import { useThemedStyles } from "../../shared/lib/hooks/useTheme";
import { Button } from "../../shared/ui";
import Card from "../../shared/ui/Card";

type MetricType = "weight" | "height" | "headCircumference";

export default function GrowthScreen() {
  const router = useRouter();
  const { activeChild } = useActiveChild();
  const [selectedMetric, setSelectedMetric] = useState<MetricType>("weight");

  const {
    data: growthData,
    isLoading,
    isError,
    refetch,
  } = useGrowthRecords(
    activeChild ? { childId: activeChild.id, limit: 50, offset: 0 } : undefined,
  );

  const styles = useThemedStyles((theme) =>
    StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: theme.colors.background,
      },
      header: {
        padding: SCREEN_PADDING,
        paddingBottom: theme.spacing.md,
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
      content: {
        flex: 1,
        padding: SCREEN_PADDING,
      },
      emptyState: {
        alignItems: "center",
        justifyContent: "center",
        padding: theme.spacing.xxl,
      },
      emptyText: {
        fontSize: theme.typography.body1.fontSize,
        color: theme.colors.textSecondary,
        textAlign: "center",
        marginBottom: theme.spacing.lg,
      },
      metricTabs: {
        flexDirection: "row",
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.xs,
        marginBottom: theme.spacing.lg,
      },
      metricTab: {
        flex: 1,
        paddingVertical: theme.spacing.sm,
        paddingHorizontal: theme.spacing.md,
        borderRadius: theme.borderRadius.sm,
        alignItems: "center",
      },
      activeMetricTab: {
        backgroundColor: theme.colors.primary,
      },
      metricTabText: {
        fontSize: theme.typography.body2.fontSize,
        color: theme.colors.textSecondary,
        fontWeight: "500",
      },
      activeMetricTabText: {
        color: theme.colors.white,
      },
      chartContainer: {
        marginBottom: theme.spacing.lg,
      },
      chartTitle: {
        fontSize: theme.typography.subtitle.fontSize,
        fontWeight: theme.typography.subtitle.fontWeight,
        color: theme.colors.text,
        marginBottom: theme.spacing.md,
        textAlign: "center",
      },
      recordsList: {
        marginBottom: theme.spacing.lg,
      },
      recordItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
      },
      recordDate: {
        fontSize: theme.typography.body2.fontSize,
        color: theme.colors.textSecondary,
      },
      recordValue: {
        fontSize: theme.typography.body1.fontSize,
        fontWeight: "600",
        color: theme.colors.text,
      },
      latestRecord: {
        backgroundColor: `${theme.colors.primary}10`,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.lg,
        borderRadius: theme.borderRadius.md,
        marginBottom: theme.spacing.lg,
      },
      latestRecordTitle: {
        fontSize: theme.typography.subtitle.fontSize,
        fontWeight: theme.typography.subtitle.fontWeight,
        color: theme.colors.primary,
        marginBottom: theme.spacing.sm,
      },
      latestRecordValue: {
        fontSize: theme.typography.title.fontSize,
        fontWeight: theme.typography.title.fontWeight,
        color: theme.colors.text,
      },
      noDataText: {
        textAlign: "center",
        color: theme.colors.textSecondary,
        padding: theme.spacing.lg,
        fontStyle: "italic",
      },
      loadingText: {
        textAlign: "center",
        color: theme.colors.textSecondary,
        padding: theme.spacing.lg,
      },
      errorText: {
        textAlign: "center",
        color: theme.colors.error,
        padding: theme.spacing.lg,
      },
    }),
  );

  if (!activeChild) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>성장 기록</Text>
          <Text style={styles.subtitle}>아이를 먼저 등록해주세요</Text>
        </View>
        <View style={styles.content}>
          <Card>
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
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

  const metrics = [
    { key: "weight", label: "몸무게", unit: "kg", icon: "⚖️" },
    { key: "height", label: "키", unit: "cm", icon: "📏" },
    { key: "headCircumference", label: "머리둘레", unit: "cm", icon: "👶" },
  ] as const;

  const formatFullDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getFilteredRecords = () => {
    const records = growthData?.growthRecords || [];
    return records
      .filter((record: GrowthRecordApi) => record[selectedMetric] !== null)
      .sort(
        (a: GrowthRecordApi, b: GrowthRecordApi) =>
          new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime(),
      );
  };

  const getLatestRecord = () => {
    const records = getFilteredRecords();
    return records.length > 0 ? records[records.length - 1] : null;
  };

  const renderMetricTabs = () => (
    <View style={styles.metricTabs}>
      {metrics.map((metric) => (
        <TouchableOpacity
          key={metric.key}
          style={[
            styles.metricTab,
            selectedMetric === metric.key && styles.activeMetricTab,
          ]}
          onPress={() => setSelectedMetric(metric.key)}
        >
          <Text
            style={[
              styles.metricTabText,
              selectedMetric === metric.key && styles.activeMetricTabText,
            ]}
          >
            {metric.icon} {metric.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderChart = () => {
    const records = getFilteredRecords();
    const currentMetric = metrics.find((m) => m.key === selectedMetric)!;

    if (records.length === 0) {
      return (
        <Card>
          <Text style={styles.noDataText}>
            {currentMetric.label} 데이터가 없습니다
          </Text>
        </Card>
      );
    }

    // 간단한 차트 대신 데이터 포인트 표시
    return (
      <Card>
        <Text style={styles.chartTitle}>
          {currentMetric.icon} {currentMetric.label} 변화
        </Text>
        <View style={styles.recordsList}>
          {records.slice(-10).map((record: GrowthRecordApi, _index: number) => (
            <View key={record.id} style={styles.recordItem}>
              <Text style={styles.recordDate}>
                {formatFullDate(record.recordedAt)}
              </Text>
              <Text style={styles.recordValue}>
                {record[selectedMetric]} {currentMetric.unit}
              </Text>
            </View>
          ))}
        </View>
      </Card>
    );
  };

  const renderLatestRecord = () => {
    const latestRecord = getLatestRecord();
    const currentMetric = metrics.find((m) => m.key === selectedMetric)!;

    if (!latestRecord) return null;

    return (
      <View style={styles.latestRecord}>
        <Text style={styles.latestRecordTitle}>최근 {currentMetric.label}</Text>
        <Text style={styles.latestRecordValue}>
          {latestRecord[selectedMetric]} {currentMetric.unit}
        </Text>
        <Text style={styles.recordDate}>
          {formatFullDate(latestRecord.recordedAt)}
        </Text>
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>성장 기록</Text>
          <Text style={styles.subtitle}>
            {activeChild?.name}의 성장 과정을 확인해보세요
          </Text>
        </View>
        <Text style={styles.loadingText}>성장 기록을 불러오는 중...</Text>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>성장 기록</Text>
          <Text style={styles.subtitle}>
            {activeChild?.name}의 성장 과정을 확인해보세요
          </Text>
        </View>
        <Text style={styles.errorText}>
          성장 기록을 불러오는 중 오류가 발생했습니다.
        </Text>
        <Button title="다시 시도" onPress={() => refetch()} variant="primary" />
      </SafeAreaView>
    );
  }

  const growthRecords = growthData?.growthRecords || [];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>성장 기록</Text>
        <Text style={styles.subtitle}>
          {activeChild?.name}의 성장 과정을 확인해보세요
        </Text>
      </View>

      {growthRecords.length === 0 ? (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Card>
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                아직 기록된 성장 데이터가 없습니다.{"\n"}첫 번째 성장 기록을
                추가해보세요!
              </Text>
              <Button
                title="성장 기록 추가"
                onPress={() => router.push("/growth/new")}
                variant="primary"
              />
            </View>
          </Card>
        </ScrollView>
      ) : (
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={refetch} />
          }
        >
          {renderMetricTabs()}

          {renderLatestRecord()}

          {renderChart()}

          {/* All Growth Records */}
          <View style={styles.recordsList}>
            <Text style={styles.chartTitle}>모든 성장 기록</Text>
            {growthRecords
              .sort(
                (a: GrowthRecordApi, b: GrowthRecordApi) =>
                  new Date(b.recordedAt).getTime() -
                  new Date(a.recordedAt).getTime(),
              )
              .map((record: GrowthRecordApi) => (
                <GrowthRecordCard
                  key={record.id}
                  growthRecord={record}
                  onPress={(record) => router.push(`/growth/${record.id}`)}
                  showUser={false}
                  showAge={true}
                />
              ))}
          </View>

          <View style={{ marginTop: SCREEN_PADDING }}>
            <Button
              title="새 성장 기록 추가"
              onPress={() => router.push("/growth/new")}
              variant="primary"
            />
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
