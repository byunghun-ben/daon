import React from "react";
import {
  WeekCalendar as RNWeekCalendar,
  type DateData,
} from "react-native-calendars";
import type { MarkedDates } from "react-native-calendars/src/types";

interface WeekCalendarProps {
  onDayPress: (day: DateData) => void;
  markedDates: MarkedDates;
}

const WeekCalendar: React.FC<WeekCalendarProps> = ({
  onDayPress,
  markedDates,
}) => {
  return (
    <RNWeekCalendar
      onDayPress={onDayPress}
      markedDates={markedDates}
      markingType="multi-dot"
      firstDay={1}
    />
  );
};

export default WeekCalendar;
