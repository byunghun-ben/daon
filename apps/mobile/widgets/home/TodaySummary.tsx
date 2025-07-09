import type { ActivityApi } from "@daon/shared";
import React from "react";
import { Text, View } from "react-native";
import { useThemedStyles } from "../../shared/lib/hooks/useTheme";
import Card from "../../shared/ui/Card/Card";

interface TodaySummaryProps {
  todayActivities: ActivityApi[];
}

interface ActivitySummary {
  feeding: number;
  diaper: number;
  sleep: number;
  tummy_time: number;
}

const TodaySummary: React.FC<TodaySummaryProps> = ({ todayActivities }) => {
  const styles = useThemedStyles((theme) => ({
    card: {
      marginBottom: theme.spacing.xl,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: "600" as const,
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
    },
    summaryGrid: {
      flexDirection: "row" as const,
      justifyContent: "space-between" as const,
    },
    summaryItem: {
      alignItems: "center" as const,
      flex: 1,
    },
    summaryValue: {
      fontSize: 24,
      fontWeight: "700" as const,
      color: theme.colors.primary,
      marginBottom: theme.spacing.xs,
    },
    summaryLabel: {
      fontSize: theme.typography.body2.fontSize,
      color: theme.colors.textSecondary,
    },
  }));

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
    { key: "tummy_time", label: "배밀이", value: summary.tummy_time },
  ];

  return (
    <Card style={styles.card}>
      <Text style={styles.cardTitle}>오늘 요약</Text>
      <View style={styles.summaryGrid}>
        {summaryItems.map((item) => (
          <View key={item.key} style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{item.value}</Text>
            <Text style={styles.summaryLabel}>{item.label}</Text>
          </View>
        ))}
      </View>
    </Card>
  );
};

export default TodaySummary;
