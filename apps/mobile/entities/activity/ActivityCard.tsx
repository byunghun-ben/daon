import { type ActivityApi } from "@daon/shared";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useThemedStyles } from "../../shared/lib/hooks/useTheme";
import Card from "../../shared/ui/Card";

interface ActivityCardProps {
  activity: ActivityApi;
  onPress?: (activity: ActivityApi) => void;
  showUser?: boolean;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({
  activity,
  onPress,
  showUser = true,
}) => {
  const styles = useThemedStyles((theme) => ({
    container: {
      marginBottom: theme.spacing.sm,
    },
    header: {
      flexDirection: "row" as const,
      justifyContent: "space-between" as const,
      alignItems: "flex-start" as const,
      marginBottom: theme.spacing.sm,
    },
    activityType: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
    },
    activityIcon: {
      fontSize: 20,
      marginRight: theme.spacing.xs,
    },
    activityLabel: {
      fontSize: theme.typography.body1.fontSize,
      fontWeight: "600" as const,
      color: theme.colors.text.primary,
    },
    timestamp: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.text.secondary,
    },
    details: {
      marginTop: theme.spacing.sm,
    },
    detailItem: {
      flexDirection: "row" as const,
      marginBottom: theme.spacing.xs,
    },
    detailLabel: {
      fontSize: theme.typography.body2.fontSize,
      color: theme.colors.text.secondary,
      marginRight: theme.spacing.sm,
      minWidth: 60,
    },
    detailValue: {
      fontSize: theme.typography.body2.fontSize,
      color: theme.colors.text.primary,
      fontWeight: "500" as const,
    },
    notes: {
      fontSize: theme.typography.body2.fontSize,
      color: theme.colors.text.secondary,
      fontStyle: "italic" as const,
      marginTop: theme.spacing.sm,
    },
    userInfo: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.text.secondary,
      marginTop: theme.spacing.sm,
    },
  }));

  const getActivityConfig = (type: string) => {
    const configs = {
      feeding: { icon: "🍼", label: "수유" },
      diaper: { icon: "👶", label: "기저귀" },
      sleep: { icon: "😴", label: "수면" },
      tummy_time: { icon: "🤸", label: "배 누워 놀기" },
      custom: { icon: "📝", label: "기타" },
    };
    return configs[type as keyof typeof configs] || configs.custom;
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();

    if (date.toDateString() === today.toDateString()) {
      return `오늘 ${formatTime(dateString)}`;
    }

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === yesterday.toDateString()) {
      return `어제 ${formatTime(dateString)}`;
    }

    return date.toLocaleDateString("ko-KR", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderActivityDetails = () => {
    const data = activity.data as any;

    switch (activity.type) {
      case "feeding":
        return (
          <View style={styles.details}>
            {data.type && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>방법:</Text>
                <Text style={styles.detailValue}>
                  {data.type === "breast"
                    ? "모유"
                    : data.type === "bottle"
                      ? "분유"
                      : "이유식"}
                </Text>
              </View>
            )}
            {data.side && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>부위:</Text>
                <Text style={styles.detailValue}>
                  {data.side === "left"
                    ? "왼쪽"
                    : data.side === "right"
                      ? "오른쪽"
                      : "양쪽"}
                </Text>
              </View>
            )}
            {data.amount && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>양:</Text>
                <Text style={styles.detailValue}>{data.amount}ml</Text>
              </View>
            )}
            {data.duration && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>시간:</Text>
                <Text style={styles.detailValue}>{data.duration}분</Text>
              </View>
            )}
          </View>
        );

      case "diaper":
        return (
          <View style={styles.details}>
            {data.type && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>상태:</Text>
                <Text style={styles.detailValue}>
                  {data.type === "wet"
                    ? "소변"
                    : data.type === "dirty"
                      ? "대변"
                      : "둘 다"}
                </Text>
              </View>
            )}
          </View>
        );

      case "sleep":
        return (
          <View style={styles.details}>
            {data.startedAt && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>시작:</Text>
                <Text style={styles.detailValue}>
                  {formatTime(data.startedAt)}
                </Text>
              </View>
            )}
            {data.endedAt && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>종료:</Text>
                <Text style={styles.detailValue}>
                  {formatTime(data.endedAt)}
                </Text>
              </View>
            )}
            {data.quality && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>품질:</Text>
                <Text style={styles.detailValue}>
                  {data.quality === "good"
                    ? "좋음"
                    : data.quality === "fair"
                      ? "보통"
                      : "나쁨"}
                </Text>
              </View>
            )}
          </View>
        );

      case "tummy_time":
        return (
          <View style={styles.details}>
            {data.duration && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>시간:</Text>
                <Text style={styles.detailValue}>{data.duration}분</Text>
              </View>
            )}
          </View>
        );

      default:
        return null;
    }
  };

  const config = getActivityConfig(activity.type);

  const handlePress = () => {
    onPress?.(activity);
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <Card>
        <View style={styles.header}>
          <View style={styles.activityType}>
            <Text style={styles.activityIcon}>{config.icon}</Text>
            <Text style={styles.activityLabel}>{config.label}</Text>
          </View>
          <Text style={styles.timestamp}>{formatDate(activity.timestamp)}</Text>
        </View>

        {renderActivityDetails()}

        {activity.notes && <Text style={styles.notes}>"{activity.notes}"</Text>}

        {showUser && activity.user && (
          <Text style={styles.userInfo}>
            기록자: {activity.user.name || activity.user.email}
          </Text>
        )}
      </Card>
    </TouchableOpacity>
  );
};
