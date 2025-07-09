import { cn } from "@/shared/lib/utils/cn";
import Card from "@/shared/ui/Card/Card";
import { type ActivityApi } from "@daon/shared";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface ActivityCardProps {
  activity: ActivityApi;
  onPress?: (activity: ActivityApi) => void;
  showUser?: boolean;
  className?: string;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({
  activity,
  onPress,
  showUser = true,
  className,
}) => {
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
          <View className="mt-sm">
            {data.type && (
              <View className="flex-row mb-xs">
                <Text className="text-sm text-text-secondary mr-sm min-w-[60px]">
                  방법:
                </Text>
                <Text className="text-sm text-text font-medium">
                  {data.type === "breast"
                    ? "모유"
                    : data.type === "bottle"
                      ? "분유"
                      : "이유식"}
                </Text>
              </View>
            )}
            {data.side && (
              <View className="flex-row mb-xs">
                <Text className="text-sm text-text-secondary mr-sm min-w-[60px]">
                  부위:
                </Text>
                <Text className="text-sm text-text font-medium">
                  {data.side === "left"
                    ? "왼쪽"
                    : data.side === "right"
                      ? "오른쪽"
                      : "양쪽"}
                </Text>
              </View>
            )}
            {data.amount && (
              <View className="flex-row mb-xs">
                <Text className="text-sm text-text-secondary mr-sm min-w-[60px]">
                  양:
                </Text>
                <Text className="text-sm text-text font-medium">
                  {data.amount}ml
                </Text>
              </View>
            )}
            {data.duration && (
              <View className="flex-row mb-xs">
                <Text className="text-sm text-text-secondary mr-sm min-w-[60px]">
                  시간:
                </Text>
                <Text className="text-sm text-text font-medium">
                  {data.duration}분
                </Text>
              </View>
            )}
          </View>
        );

      case "diaper":
        return (
          <View className="mt-sm">
            {data.type && (
              <View className="flex-row mb-xs">
                <Text className="text-sm text-text-secondary mr-sm min-w-[60px]">
                  상태:
                </Text>
                <Text className="text-sm text-text font-medium">
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
          <View className="mt-sm">
            {data.startedAt && (
              <View className="flex-row mb-xs">
                <Text className="text-sm text-text-secondary mr-sm min-w-[60px]">
                  시작:
                </Text>
                <Text className="text-sm text-text font-medium">
                  {formatTime(data.startedAt)}
                </Text>
              </View>
            )}
            {data.endedAt && (
              <View className="flex-row mb-xs">
                <Text className="text-sm text-text-secondary mr-sm min-w-[60px]">
                  종료:
                </Text>
                <Text className="text-sm text-text font-medium">
                  {formatTime(data.endedAt)}
                </Text>
              </View>
            )}
            {data.quality && (
              <View className="flex-row mb-xs">
                <Text className="text-sm text-text-secondary mr-sm min-w-[60px]">
                  품질:
                </Text>
                <Text className="text-sm text-text font-medium">
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
          <View className="mt-sm">
            {data.duration && (
              <View className="flex-row mb-xs">
                <Text className="text-sm text-text-secondary mr-sm min-w-[60px]">
                  시간:
                </Text>
                <Text className="text-sm text-text font-medium">
                  {data.duration}분
                </Text>
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
      className={cn("mb-sm", className)}
      onPress={handlePress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <Card>
        <View className="flex-row justify-between items-start mb-sm">
          <View className="flex-row items-center">
            <Text className="text-[20px] mr-xs">{config.icon}</Text>
            <Text className="text-base font-semibold text-text">
              {config.label}
            </Text>
          </View>
          <Text className="text-xs text-text-secondary">
            {formatDate(activity.timestamp)}
          </Text>
        </View>

        {renderActivityDetails()}

        {activity.notes && (
          <Text className="text-sm text-text-secondary italic mt-sm">
            &quot;{activity.notes}&quot;
          </Text>
        )}

        {showUser && activity.user && (
          <Text className="text-xs text-text-secondary mt-sm">
            기록자: {activity.user.name || activity.user.email}
          </Text>
        )}
      </Card>
    </TouchableOpacity>
  );
};
