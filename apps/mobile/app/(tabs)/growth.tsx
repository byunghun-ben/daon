import { GrowthRecordCard } from "@/entities/growth-record/GrowthRecordCard";
import { useGrowthRecords } from "@/shared/api/growth/hooks/useGrowthRecords";
import { useActiveChild } from "@/shared/hooks/useActiveChild";
import { cn } from "@/shared/lib/utils/cn";
import { ButtonV2, ButtonText } from "@/shared/ui/Button/ButtonV2";
import Card from "@/shared/ui/Card/Card";
import type { GrowthRecordApi } from "@daon/shared";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

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

  if (!activeChild) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="p-4 pb-4">
          <Text className="text-2xl font-bold text-foreground mb-2">
            성장 기록
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
    <View className="flex-row bg-surface rounded-lg p-1 mb-6">
      {metrics.map((metric) => (
        <TouchableOpacity
          key={metric.key}
          className={cn(
            "flex-1 py-2 px-4 rounded items-center",
            selectedMetric === metric.key && "bg-primary",
          )}
          onPress={() => setSelectedMetric(metric.key)}
        >
          <Text
            className={cn(
              "text-sm text-muted-foreground font-medium",
              selectedMetric === metric.key && "text-white",
            )}
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
          <Text className="text-center text-muted-foreground p-6 italic">
            {currentMetric.label} 데이터가 없습니다
          </Text>
        </Card>
      );
    }

    // 간단한 차트 대신 데이터 포인트 표시
    return (
      <Card>
        <Text className="text-base font-semibold text-foreground mb-4 text-center">
          {currentMetric.icon} {currentMetric.label} 변화
        </Text>
        <View className="mb-6">
          {records.slice(-10).map((record: GrowthRecordApi, _index: number) => (
            <View
              key={record.id}
              className="flex-row justify-between items-center py-4 border-b border-border"
            >
              <Text className="text-sm text-muted-foreground">
                {formatFullDate(record.recordedAt)}
              </Text>
              <Text className="text-base font-semibold text-foreground">
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
      <View className="bg-primary/10 px-4 py-6 rounded-lg mb-6">
        <Text className="text-base font-semibold text-primary mb-2">
          최근 {currentMetric.label}
        </Text>
        <Text className="text-2xl font-bold text-foreground">
          {latestRecord[selectedMetric]} {currentMetric.unit}
        </Text>
        <Text className="text-sm text-muted-foreground">
          {formatFullDate(latestRecord.recordedAt)}
        </Text>
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="p-4 pb-4">
          <Text className="text-2xl font-bold text-foreground mb-2">
            성장 기록
          </Text>
          <Text className="text-sm text-muted-foreground">
            {activeChild?.name}의 성장 과정을 확인해보세요
          </Text>
        </View>
        <Text className="text-center text-muted-foreground p-6">
          성장 기록을 불러오는 중...
        </Text>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="p-4 pb-4">
          <Text className="text-2xl font-bold text-foreground mb-2">
            성장 기록
          </Text>
          <Text className="text-sm text-muted-foreground">
            {activeChild?.name}의 성장 과정을 확인해보세요
          </Text>
        </View>
        <Text className="text-center text-destructive p-6">
          성장 기록을 불러오는 중 오류가 발생했습니다.
        </Text>
        <ButtonV2 onPress={() => refetch()} variant="default">
          <ButtonText>다시 시도</ButtonText>
        </ButtonV2>
      </SafeAreaView>
    );
  }

  const growthRecords = growthData?.growthRecords || [];

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="p-4 pb-4">
        <Text className="text-2xl font-bold text-foreground mb-2">
          성장 기록
        </Text>
        <Text className="text-sm text-muted-foreground">
          {activeChild?.name}의 성장 과정을 확인해보세요
        </Text>
      </View>

      {growthRecords.length === 0 ? (
        <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
          <Card>
            <View className="items-center justify-center p-8">
              <Text className="text-base text-muted-foreground text-center mb-6">
                아직 기록된 성장 데이터가 없습니다.{"\n"}첫 번째 성장 기록을
                추가해보세요!
              </Text>
              <ButtonV2
                onPress={() => router.push("/growth/new")}
                variant="default"
              >
                <ButtonText>성장 기록 추가</ButtonText>
              </ButtonV2>
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
          {renderMetricTabs()}

          {renderLatestRecord()}

          {renderChart()}

          {/* All Growth Records */}
          <View className="mb-6">
            <Text className="text-base font-semibold text-foreground mb-4 text-center">
              모든 성장 기록
            </Text>
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

          <View className="mt-4">
            <ButtonV2
              onPress={() => router.push("/growth/new")}
              variant="default"
            >
              <ButtonText>새 성장 기록 추가</ButtonText>
            </ButtonV2>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
