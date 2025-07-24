import Card from "@/shared/ui/Card/Card";
import type { ActivityApi, ChildApi } from "@daon/shared";
import React, { useState } from "react";
import { Text, View } from "react-native";
import { CalendarProvider, type DateData } from "react-native-calendars";
import "./localeConfig"; // 한국어 locale 설정 적용
import MonthCalendar from "./MonthCalendar";

export type CalendarViewType = "month" | "week";

interface CalendarWidgetProps {
  activities?: ActivityApi[];
  children?: ChildApi[];
  selectedDate?: string;
  onDateSelect?: (date: string) => void;
}

interface MarkedDates {
  [date: string]: {
    marked: boolean;
    dots?: { color: string }[];
    selectedColor?: string;
    selected?: boolean;
  };
}

const CalendarWidget: React.FC<CalendarWidgetProps> = ({
  activities = [],
  children = [],
  selectedDate: externalSelectedDate,
  onDateSelect,
}) => {
  const [internalSelectedDate, setInternalSelectedDate] = useState<string>("");

  const selectedDate = externalSelectedDate || internalSelectedDate;

  // 아이별 색상 매핑 (최대 5명까지 고려)
  const getChildColor = (childId: string): string => {
    const colors = ["#007AFF", "#FF3B30", "#34C759", "#FF9500", "#AF52DE"];
    const index = children.findIndex((child) => child.id === childId);
    return colors[index % colors.length] || "#007AFF";
  };

  // 활동 데이터를 기반으로 날짜 마킹 생성 - 모든 아이들의 데이터 통합
  const getMarkedDates = (): MarkedDates => {
    const marked: MarkedDates = {};

    activities.forEach((activity) => {
      const date = new Date(activity.timestamp).toISOString().split("T")[0];
      const childColor = getChildColor(activity.childId);

      if (!marked[date]) {
        marked[date] = {
          marked: true,
          dots: [],
        };
      }

      // 해당 날짜에 이미 같은 아이의 점이 있는지 확인
      const existingDot = marked[date].dots?.find(
        (dot) => dot.color === childColor,
      );
      if (!existingDot) {
        marked[date].dots?.push({ color: childColor });
      }
    });

    // 선택된 날짜 표시
    if (selectedDate) {
      marked[selectedDate] = {
        ...marked[selectedDate],
        selected: true,
        selectedColor: "#007AFF",
      };
    }

    return marked;
  };

  const handleDayPress = (day: DateData) => {
    if (!externalSelectedDate) {
      setInternalSelectedDate(day.dateString);
    }
    onDateSelect?.(day.dateString);
  };

  const markedDates = getMarkedDates();

  return (
    <Card>
      <View>
        {/* 아이별 색상 범례 */}
        {children.length > 0 && (
          <View className="mb-4">
            <Text className="text-xs text-text-secondary mb-2">범례</Text>
            <View className="flex-row flex-wrap gap-2">
              {children.map((child) => (
                <View key={child.id} className="flex-row items-center">
                  <View
                    className="w-3 h-3 rounded-full mr-1"
                    style={{ backgroundColor: getChildColor(child.id) }}
                  />
                  <Text className="text-xs text-text-secondary">
                    {child.name}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* 캘린더 */}
        <CalendarProvider
          date={selectedDate || new Date().toISOString().split("T")[0]}
        >
          <MonthCalendar
            onDayPress={handleDayPress}
            markedDates={markedDates}
          />
        </CalendarProvider>
      </View>
    </Card>
  );
};

export default CalendarWidget;
