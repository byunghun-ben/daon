import Card from "@/shared/ui/Card/Card";
import type { ActivityApi, ChildApi, DiaryEntryApi } from "@daon/shared";
import React from "react";
import { Text, View } from "react-native";

interface DateDetailWidgetProps {
  selectedDate?: string;
  activities?: ActivityApi[];
  diaryEntries?: DiaryEntryApi[];
  children?: ChildApi[];
}

const DateDetailWidget: React.FC<DateDetailWidgetProps> = ({
  selectedDate,
  activities = [],
  diaryEntries = [],
  children = [],
}) => {
  // 선택된 날짜가 없으면 아무것도 렌더링하지 않음
  if (!selectedDate) {
    return null;
  }

  // 선택된 날짜의 활동 필터링
  const selectedDateActivities = activities.filter((activity) => {
    const activityDate = new Date(activity.timestamp)
      .toISOString()
      .split("T")[0];
    return activityDate === selectedDate;
  });

  // 선택된 날짜의 일기 필터링
  const selectedDateDiaryEntries = diaryEntries.filter((entry) => {
    const entryDate = new Date(entry.date).toISOString().split("T")[0];
    return entryDate === selectedDate;
  });

  // 아이 이름 가져오기 함수
  const getChildName = (childId: string): string => {
    const child = children.find((c) => c.id === childId);
    return child?.name || "알 수 없음";
  };

  // 활동 타입 한국어 변환
  const getActivityTypeText = (type: string): string => {
    const typeMap: { [key: string]: string } = {
      feeding: "수유",
      diaper: "기저귀",
      sleep: "수면",
      tummy_time: "배밀이",
      custom: "기타",
    };
    return typeMap[type] || type;
  };

  // 날짜 포맷팅
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    });
  };

  const hasAnyData =
    selectedDateActivities.length > 0 || selectedDateDiaryEntries.length > 0;

  return (
    <Card>
      <View className="p-4">
        {/* 선택된 날짜 헤더 */}
        <View className="mb-4">
          <Text className="text-lg font-semibold text-text-primary">
            {formatDate(selectedDate)}
          </Text>
          <Text className="text-sm text-text-secondary">
            이날의 기록을 확인해보세요
          </Text>
        </View>

        {!hasAnyData ? (
          /* 데이터가 없는 경우 */
          <View className="py-8 items-center">
            <Text className="text-text-secondary text-center">
              해당 날짜에 기록된 활동이나 일기가 없습니다.
            </Text>
          </View>
        ) : (
          <View>
            {/* 활동 목록 */}
            {selectedDateActivities.length > 0 && (
              <View className="mb-4">
                <Text className="text-base font-medium text-text-primary mb-2">
                  활동 기록 ({selectedDateActivities.length}개)
                </Text>
                <View className="space-y-2">
                  {selectedDateActivities.map((activity) => (
                    <View
                      key={activity.id}
                      className="flex-row justify-between items-center p-3 bg-gray-50 rounded-lg"
                    >
                      <View className="flex-1">
                        <Text className="text-sm font-medium text-text-primary">
                          {getActivityTypeText(activity.type)}
                        </Text>
                        <Text className="text-xs text-text-secondary">
                          {getChildName(activity.childId)} •{" "}
                          {new Date(activity.timestamp).toLocaleTimeString(
                            "ko-KR",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* 일기 목록 */}
            {selectedDateDiaryEntries.length > 0 && (
              <View>
                <Text className="text-base font-medium text-text-primary mb-2">
                  일기 ({selectedDateDiaryEntries.length}개)
                </Text>
                <View className="space-y-2">
                  {selectedDateDiaryEntries.map((entry) => (
                    <View key={entry.id} className="p-3 bg-blue-50 rounded-lg">
                      <Text className="text-sm font-medium text-text-primary mb-1">
                        {getChildName(entry.childId)}의 일기
                      </Text>
                      <Text
                        className="text-sm text-text-secondary"
                        numberOfLines={2}
                      >
                        {entry.content}
                      </Text>
                      {entry.photos && entry.photos.length > 0 && (
                        <Text className="text-xs text-blue-600 mt-1">
                          📷 사진 {entry.photos.length}장
                        </Text>
                      )}
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}
      </View>
    </Card>
  );
};

export default DateDetailWidget;
