import { useCalendarActivities } from "@/shared/api/hooks/useActivities";
import { useChildren } from "@/shared/api/hooks/useChildren";
import CalendarWidget from "@/widgets/calendar/CalendarWidget";
import DateDetailWidget from "@/widgets/calendar/DateDetailWidget";
import { useState, useMemo } from "react";
import { SafeAreaView, ScrollView, Text, View } from "react-native";

export default function CalendarScreen() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const { data: children } = useChildren();

  // 현재 표시된 월의 시작과 끝 날짜 계산
  const monthRange = useMemo(() => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();

    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59);

    return {
      dateFrom: startOfMonth.toISOString(),
      dateTo: endOfMonth.toISOString(),
    };
  }, [selectedDate]);

  // 모든 아이들의 월별 활동 데이터 가져오기
  const { data: activities } = useCalendarActivities(
    monthRange.dateFrom,
    monthRange.dateTo,
  );

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        {/* 헤더 */}
        <View className="py-4">
          <Text className="text-2xl font-bold text-text-primary">캘린더</Text>
          <Text className="text-sm text-text-secondary mt-1">
            모든 아이들의 활동을 한눈에 확인하세요
          </Text>
        </View>

        {/* 캘린더 위젯 */}
        <View className="mb-4">
          <CalendarWidget
            activities={activities || []}
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
            childrenList={children || []}
          />
        </View>

        {/* 선택된 날짜 상세 정보 위젯 */}
        {selectedDate && (
          <View className="mb-4">
            <DateDetailWidget selectedDate={selectedDate} />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
