import type { ActivityApi } from "@daon/shared";
import React from "react";
import { Text, View } from "react-native";
import Card from "../../shared/ui/Card/Card";

interface TodaySummaryProps {
  todayActivities: ActivityApi[];
  childName?: string;
}

interface ActivitySummary {
  feeding: number;
  diaper: number;
  sleep: number;
  tummy_time: number;
}

const TodaySummary: React.FC<TodaySummaryProps> = ({
  todayActivities,
  childName,
}) => {
  // 오늘 활동 요약 계산
  const getSummary = (): ActivitySummary => {
    const summary: ActivitySummary = {
      feeding: 0,
      diaper: 0,
      sleep: 0,
      tummy_time: 0,
    };

    todayActivities.forEach((activity) => {
      if (activity.type in summary) {
        summary[activity.type as keyof ActivitySummary]++;
      }
    });

    return summary;
  };

  const summary = getSummary();

  const summaryItems = [
    { key: "feeding", label: "수유", value: summary.feeding },
    { key: "diaper", label: "기저귀", value: summary.diaper },
    { key: "sleep", label: "수면", value: summary.sleep },
  ];

  return (
    <Card>
      <Text className="text-xl font-bold mb-4">
        {childName ? `${childName} 오늘 요약` : "오늘 요약"}
      </Text>
      <View className="flex-row justify-between">
        {summaryItems.map((item) => (
          <View key={item.key} className="flex-1 items-center">
            <Text className="text-2xl font-bold text-primary">
              {item.value}
            </Text>
            <Text className="text-sm text-gray-500">{item.label}</Text>
          </View>
        ))}
      </View>
    </Card>
  );
};

export default TodaySummary;
