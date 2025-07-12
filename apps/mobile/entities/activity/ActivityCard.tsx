import { cn } from "@/shared/lib/utils/cn";
import Card from "@/shared/ui/Card/Card";
import type {
  ActivityApi,
  ChildApi,
  DiaperDataApi,
  FeedingDataApi,
  SleepDataApi,
  TummyTimeDataApi,
} from "@daon/shared";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface ActivityCardProps {
  activity: ActivityApi;
  onPress?: (activity: ActivityApi) => void;
  showUser?: boolean;
  showChild?: boolean;
  childList?: ChildApi[];
  className?: string;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({
  activity,
  onPress,
  showUser = true,
  showChild = false,
  childList,
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
    const data = activity.data;

    switch (activity.type) {
      case "feeding": {
        const feedingData = data as FeedingDataApi;
        return (
          <View>
            {feedingData.type && (
              <View className="flex-row gap-2 items-center">
                <Text className="text-lg text-text-secondary">방법:</Text>
                <Text className="text-lg text-text font-medium">
                  {feedingData.type === "breast"
                    ? "모유"
                    : feedingData.type === "bottle"
                      ? "분유"
                      : "이유식"}
                </Text>
              </View>
            )}
            {feedingData.amount && (
              <View className="flex-row gap-2 items-center">
                <Text className="text-lg text-text-secondary">양:</Text>
                <Text className="text-lg text-text font-medium">
                  {feedingData.amount}ml
                </Text>
              </View>
            )}
            {feedingData.duration && (
              <View className="flex-row gap-2 items-center">
                <Text className="text-lg text-text-secondary">시간:</Text>
                <Text className="text-lg text-text font-medium">
                  {feedingData.duration}분
                </Text>
              </View>
            )}
          </View>
        );
      }

      case "diaper": {
        const diaperData = data as DiaperDataApi;
        return (
          <View>
            {diaperData.type && (
              <View className="flex-row mb-xs">
                <Text className="text-sm text-text-secondary mr-sm min-w-[60px]">
                  상태:
                </Text>
                <Text className="text-sm text-text font-medium">
                  {diaperData.type === "wet"
                    ? "소변"
                    : diaperData.type === "dirty"
                      ? "대변"
                      : "둘 다"}
                </Text>
              </View>
            )}
          </View>
        );
      }

      case "sleep": {
        const sleepData = data as SleepDataApi;

        return (
          <View>
            {sleepData.startedAt && (
              <View className="flex-row mb-xs">
                <Text className="text-sm text-text-secondary mr-sm min-w-[60px]">
                  시작:
                </Text>
                <Text className="text-sm text-text font-medium">
                  {formatTime(sleepData.startedAt)}
                </Text>
              </View>
            )}
            {sleepData.endedAt && (
              <View className="flex-row mb-xs">
                <Text className="text-sm text-text-secondary mr-sm min-w-[60px]">
                  종료:
                </Text>
                <Text className="text-sm text-text font-medium">
                  {formatTime(sleepData.endedAt)}
                </Text>
              </View>
            )}
            {sleepData.quality && (
              <View className="flex-row mb-xs">
                <Text className="text-sm text-text-secondary mr-sm min-w-[60px]">
                  품질:
                </Text>
                <Text className="text-sm text-text font-medium">
                  {sleepData.quality === "good"
                    ? "좋음"
                    : sleepData.quality === "fair"
                      ? "보통"
                      : "나쁨"}
                </Text>
              </View>
            )}
          </View>
        );
      }

      case "tummy_time": {
        const tummyTimeData = data as TummyTimeDataApi;
        return (
          <View>
            {tummyTimeData.duration && (
              <View className="flex-row mb-xs">
                <Text className="text-sm text-text-secondary mr-sm min-w-[60px]">
                  시간:
                </Text>
                <Text className="text-sm text-text font-medium">
                  {tummyTimeData.duration}분
                </Text>
              </View>
            )}
          </View>
        );
      }

      default:
        return null;
    }
  };

  const config = getActivityConfig(activity.type);

  const handlePress = () => {
    onPress?.(activity);
  };

  const getChildName = (childId: string): string | null => {
    if (!childList) return null;
    const child = childList.find((c) => c.id === childId);
    return child?.name || null;
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
            {showChild &&
              childList &&
              childList.length > 1 &&
              getChildName(activity.childId) && (
                <View className="bg-primary px-2 py-0.5 rounded ml-2">
                  <Text className="text-white text-xs font-semibold">
                    {getChildName(activity.childId)}
                  </Text>
                </View>
              )}
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
