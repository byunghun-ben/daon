import type { ActivityApi, ActivityType, ChildApi } from "@daon/shared";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { ButtonV2, ButtonText } from "../../shared/ui/Button/ButtonV2";
import Card from "../../shared/ui/Card/Card";

interface RecentActivitiesProps {
  activities: ActivityApi[];
  childList?: ChildApi[]; // 아이 정보를 받아서 이름을 표시
  onActivityPress: (activity: ActivityApi) => void;
  onViewAllPress: () => void;
  onFirstActivityPress: () => void;
}

const RecentActivities: React.FC<RecentActivitiesProps> = ({
  activities,
  childList,
  onActivityPress,
  onViewAllPress,
  onFirstActivityPress,
}) => {
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

  // childId로 아이 이름 찾기
  const getChildName = (childId: string): string | null => {
    if (!childList) return null;
    const child = childList.find((c) => c.id === childId);
    return child?.name || null;
  };

  return (
    <Card>
      <Text className="text-lg font-semibold text-foreground mb-4">
        최근 활동
      </Text>
      {activities.length === 0 ? (
        <>
          <Text className="text-sm text-muted-foreground text-center py-6">
            아직 기록된 활동이 없습니다.
          </Text>
          <ButtonV2 variant="outline" onPress={onFirstActivityPress}>
            <ButtonText>첫 활동 기록하기</ButtonText>
          </ButtonV2>
        </>
      ) : (
        <>
          {activities.map((activity) => (
            <TouchableOpacity
              key={activity.id}
              className="p-4 border-b border-border"
              onPress={() => onActivityPress(activity)}
            >
              <View className="flex-row justify-between items-center mb-1">
                <View className="flex-row items-center">
                  <Text className="text-base font-semibold text-foreground">
                    {formatActivityType(activity.type)}
                  </Text>
                  {childList &&
                    childList.length > 1 &&
                    getChildName(activity.childId) && (
                      <View className="bg-primary px-2 py-0.5 rounded ml-2">
                        <Text className="text-white text-xs font-semibold">
                          {getChildName(activity.childId)}
                        </Text>
                      </View>
                    )}
                </View>
                <Text className="text-sm text-muted-foreground">
                  {formatTime(activity.timestamp)}
                </Text>
              </View>
              {activity.notes && (
                <Text
                  className="text-sm text-muted-foreground mt-1"
                  numberOfLines={2}
                >
                  {activity.notes}
                </Text>
              )}
            </TouchableOpacity>
          ))}
          <ButtonV2 variant="outline" onPress={onViewAllPress}>
            <ButtonText>모든 활동 보기</ButtonText>
          </ButtonV2>
        </>
      )}
    </Card>
  );
};

export default RecentActivities;
