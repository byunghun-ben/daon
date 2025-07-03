import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useThemedStyles } from "../../shared/lib/hooks/useTheme";
import Card from "../../shared/ui/Card";
import Button from "../../shared/ui/Button";
import type { ActivityApi, ActivityType } from "@daon/shared";

interface RecentActivitiesProps {
  activities: ActivityApi[];
  onActivityPress: (activity: ActivityApi) => void;
  onViewAllPress: () => void;
  onFirstActivityPress: () => void;
}

const RecentActivities: React.FC<RecentActivitiesProps> = ({
  activities,
  onActivityPress,
  onViewAllPress,
  onFirstActivityPress,
}) => {
  const styles = useThemedStyles((theme) => ({
    sectionTitle: {
      fontSize: 18,
      fontWeight: "600" as const,
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
    },
    emptyText: {
      fontSize: theme.typography.body2.fontSize,
      color: theme.colors.textMuted,
      textAlign: "center" as const,
      paddingVertical: theme.spacing.lg,
    },
    activityItem: {
      padding: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    activityHeader: {
      flexDirection: "row" as const,
      justifyContent: "space-between" as const,
      alignItems: "center" as const,
      marginBottom: theme.spacing.xs,
    },
    activityType: {
      fontSize: theme.typography.body1.fontSize,
      fontWeight: "600" as const,
      color: theme.colors.text,
    },
    activityTime: {
      fontSize: theme.typography.body2.fontSize,
      color: theme.colors.textSecondary,
    },
    activityNotes: {
      fontSize: theme.typography.body2.fontSize,
      color: theme.colors.textMuted,
      marginTop: theme.spacing.xs,
    },
  }));

  const formatActivityType = (type: ActivityType): string => {
    const typeMap = {
      feeding: "수유",
      diaper: "기저귀",
      sleep: "수면",
      tummy_time: "배밀이",
      custom: "사용자 정의",
    };
    return typeMap[type] || type;
  };

  const formatTime = (dateString: string): string => {
    return new Date(dateString).toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card>
      <Text style={styles.sectionTitle}>최근 활동</Text>
      {activities.length === 0 ? (
        <>
          <Text style={styles.emptyText}>아직 기록된 활동이 없습니다.</Text>
          <Button
            title="첫 활동 기록하기"
            variant="outline"
            onPress={onFirstActivityPress}
          />
        </>
      ) : (
        <>
          {activities.map((activity) => (
            <TouchableOpacity
              key={activity.id}
              style={styles.activityItem}
              onPress={() => onActivityPress(activity)}
            >
              <View style={styles.activityHeader}>
                <Text style={styles.activityType}>
                  {formatActivityType(activity.type)}
                </Text>
                <Text style={styles.activityTime}>
                  {formatTime(activity.timestamp)}
                </Text>
              </View>
              {activity.notes && (
                <Text style={styles.activityNotes} numberOfLines={2}>
                  {activity.notes}
                </Text>
              )}
            </TouchableOpacity>
          ))}
          <Button
            title="모든 활동 보기"
            variant="outline"
            onPress={onViewAllPress}
          />
        </>
      )}
    </Card>
  );
};

export default RecentActivities;
