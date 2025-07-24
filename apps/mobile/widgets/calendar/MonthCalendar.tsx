import React from "react";
import { Dimensions } from "react-native";
import { CalendarList, type DateData } from "react-native-calendars";
import type { MarkedDates } from "react-native-calendars/src/types";

interface MonthCalendarProps {
  onDayPress: (day: DateData) => void;
  markedDates: MarkedDates;
}

const MonthCalendar: React.FC<MonthCalendarProps> = ({
  onDayPress,
  markedDates,
}) => {
  const screenWidth = Dimensions.get("window").width;

  return (
    <CalendarList
      style={{ width: screenWidth - 56 }} // 패딩 고려한 정확한 너비 설정
      onDayPress={onDayPress}
      markedDates={markedDates}
      markingType="multi-dot"
      theme={{
        textMonthFontWeight: "600",
        textMonthFontSize: 18,
        textDayHeaderFontWeight: "600",
        textDayHeaderFontSize: 14,
        textDayFontWeight: "400",
        textDayFontSize: 16,
      }}
      firstDay={1}
      // 스와이프 설정 개선
      horizontal={true}
      pagingEnabled={true}
      scrollEnabled={true}
      showScrollIndicator={false}
      pastScrollRange={12}
      futureScrollRange={12}
      calendarHeight={350}
      calendarWidth={screenWidth - 56}
      // 스와이프 감도 및 스냅 설정
      removeClippedSubviews={false}
      staticHeader={true}
      // 스와이프 동작 개선을 위한 추가 설정
      nestedScrollEnabled={false}
      keyboardShouldPersistTaps="handled"
      // 더 나은 페이징을 위한 추가 설정
      decelerationRate="fast"
      snapToAlignment="center"
      hideArrows
    />
  );
};

export default MonthCalendar;
