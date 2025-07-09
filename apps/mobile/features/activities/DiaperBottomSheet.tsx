import type { CreateActivityRequest } from "@daon/shared";
import { zodResolver } from "@hookform/resolvers/zod";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { z } from "zod/v4";
import { useCreateActivity } from "../../shared/api/hooks/useActivities";
import { useActiveChild } from "../../shared/hooks/useActiveChild";
import BottomSheet from "../../shared/ui/BottomSheet";
import Button from "../../shared/ui/Button/Button";
import Input from "../../shared/ui/Input/Input";

// 기저귀 교체 폼 스키마
const DiaperFormSchema = z.object({
  type: z.enum(["wet", "dirty", "both"]),
  notes: z.string().optional(),
});

type DiaperFormData = z.infer<typeof DiaperFormSchema>;

interface DiaperBottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
}

export const DiaperBottomSheet: React.FC<DiaperBottomSheetProps> = ({
  isVisible,
  onClose,
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const { activeChild } = useActiveChild();
  const createActivityMutation = useCreateActivity();

  const form = useForm<DiaperFormData>({
    resolver: zodResolver(DiaperFormSchema),
    defaultValues: {
      type: "wet",
      notes: "",
    },
  });

  const handleSubmit = async (data: DiaperFormData) => {
    if (!activeChild) {
      Alert.alert("알림", "아이를 먼저 선택해주세요.");
      return;
    }

    try {
      const activityData: CreateActivityRequest = {
        childId: activeChild.id,
        type: "diaper",
        timestamp: selectedDate.toISOString(),
        data: {
          type: data.type,
        },
        notes: data.notes || undefined,
      };

      await createActivityMutation.mutateAsync(activityData);

      Alert.alert("성공", "기저귀 교체 기록이 저장되었습니다.", [
        {
          text: "확인",
          onPress: () => {
            form.reset();
            setSelectedDate(new Date());
            onClose();
          },
        },
      ]);
    } catch (error) {
      console.error("Failed to create diaper record:", error);
      Alert.alert("오류", "기저귀 교체 기록 저장에 실패했습니다.");
    }
  };

  return (
    <BottomSheet visible={isVisible} onClose={onClose} height={450}>
      <View className="flex-1 px-6 py-4">
        <Text className="text-xl font-bold mb-4">기저귀 교체</Text>

        {/* 시간 선택 */}
        <View className="mb-4">
          <Text className="text-base font-medium mb-2">시간</Text>
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            className="bg-gray-100 p-3 rounded-lg"
          >
            <Text>
              {selectedDate.toLocaleString("ko-KR", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="datetime"
              display="spinner"
              onChange={(event, date) => {
                setShowDatePicker(false);
                if (date) setSelectedDate(date);
              }}
            />
          )}
        </View>

        {/* 기저귀 상태 선택 */}
        <View className="mb-4">
          <Text className="text-base font-medium mb-2">기저귀 상태</Text>
          <Controller
            control={form.control}
            name="type"
            render={({ field: { onChange, value } }) => (
              <View className="flex-row gap-2">
                <TouchableOpacity
                  onPress={() => onChange("wet")}
                  className={`flex-1 p-3 rounded-lg items-center ${
                    value === "wet" ? "bg-primary" : "bg-gray-100"
                  }`}
                >
                  <Text
                    className={`font-medium ${
                      value === "wet" ? "text-white" : "text-gray-700"
                    }`}
                  >
                    소변 💧
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => onChange("dirty")}
                  className={`flex-1 p-3 rounded-lg items-center ${
                    value === "dirty" ? "bg-primary" : "bg-gray-100"
                  }`}
                >
                  <Text
                    className={`font-medium ${
                      value === "dirty" ? "text-white" : "text-gray-700"
                    }`}
                  >
                    대변 💩
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => onChange("both")}
                  className={`flex-1 p-3 rounded-lg items-center ${
                    value === "both" ? "bg-primary" : "bg-gray-100"
                  }`}
                >
                  <Text
                    className={`font-medium ${
                      value === "both" ? "text-white" : "text-gray-700"
                    }`}
                  >
                    둘 다 🌊
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          />
        </View>

        {/* 메모 */}
        <Controller
          control={form.control}
          name="notes"
          render={({ field: { onChange, value } }) => (
            <Input
              label="메모 (선택사항)"
              value={value || ""}
              onChangeText={onChange}
              placeholder="색상, 상태 등 특이사항을 입력하세요"
              multiline
              numberOfLines={3}
              style={{ textAlignVertical: "top" }}
            />
          )}
        />

        {/* 버튼 */}
        <View className="flex-row gap-3 mt-6">
          <Button
            title="취소"
            variant="outline"
            onPress={onClose}
            className="flex-1"
          />
          <Button
            title={createActivityMutation.isPending ? "저장 중..." : "저장"}
            variant="primary"
            onPress={form.handleSubmit(handleSubmit)}
            disabled={createActivityMutation.isPending}
            className="flex-1"
          />
        </View>
      </View>
    </BottomSheet>
  );
};
