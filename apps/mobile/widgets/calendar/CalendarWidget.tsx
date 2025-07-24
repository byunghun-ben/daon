import Card from "@/shared/ui/Card/Card";
import type { ActivityApi, ChildApi } from "@daon/shared";
import React, { useState } from "react";
import { CalendarProvider, type DateData } from "react-native-calendars";
import "./localeConfig"; // 한국어 locale 설정 적용
import MonthCalendar from "./MonthCalendar";

export type CalendarViewType = "month" | "week";

interface CalendarWidgetProps {
  activities?: ActivityApi[];
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
  childrenList?: ChildApi[];
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
  selectedDate: externalSelectedDate,
  onDateSelect,
  childrenList = [],
}) => {
  const [internalSelectedDate, setInternalSelectedDate] = useState<Date>(
    new Date(),
  );

  const selectedDate = externalSelectedDate || internalSelectedDate;
  const selectedDateString = selectedDate.toISOString().split("T")[0];

  // 아이별 색상 매핑 (최대 5명까지 고려)
  const getChildColor = (childId: string): string => {
    const colors = ["#007AFF", "#FF3B30", "#34C759", "#FF9500", "#AF52DE"];
    const index = childrenList.findIndex((child) => child.id === childId);
    return colors[index % colors.length] || "#007AFF";
  };

  // 활동 데이터를 기반으로 날짜 마킹 생성 - 모든 아이들의 데이터 통합
  const getMarkedDates = (): MarkedDates => {
    const marked: MarkedDates = {};

    activities.forEach((activity) => {
      const date = new Date(activity.timestamp);
      const dateString = date.toISOString().split("T")[0];
      const childColor = getChildColor(activity.childId);

      if (!marked[dateString]) {
        marked[dateString] = {
          marked: true,
          dots: [],
        };
      }

      // 해당 날짜에 이미 같은 아이의 점이 있는지 확인
      const existingDot = marked[dateString].dots?.find(
        (dot) => dot.color === childColor,
      );
      if (!existingDot) {
        marked[dateString].dots?.push({ color: childColor });
      }
    });

    // 선택된 날짜 표시
    if (selectedDate) {
      marked[selectedDateString] = {
        ...marked[selectedDateString],
        selected: true,
        selectedColor: "#007AFF",
      };
    }

    return marked;
  };

  const handleDayPress = (day: DateData) => {
    if (!externalSelectedDate) {
      setInternalSelectedDate(new Date(day.dateString));
    }
    onDateSelect?.(new Date(day.dateString));
  };

  const markedDates = getMarkedDates();

  return (
    <Card>
      {/* 캘린더 */}
      <CalendarProvider date={selectedDateString}>
        <MonthCalendar onDayPress={handleDayPress} markedDates={markedDates} />
      </CalendarProvider>
    </Card>
  );
};

export default CalendarWidget;
