import CalendarWidget from "@/widgets/calendar/CalendarWidget";
import DateDetailWidget from "@/widgets/calendar/DateDetailWidget";
import { useState } from "react";
import { SafeAreaView, ScrollView, Text, View } from "react-native";

export default function CalendarScreen() {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );

  const handleDateSelect = (date: string) => {
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
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
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
