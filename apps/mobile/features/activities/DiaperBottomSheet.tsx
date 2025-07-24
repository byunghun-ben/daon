import { useCreateActivity } from "@/shared/api/hooks/useActivities";
import { useActiveChild } from "@/shared/hooks/useActiveChild";
import { ButtonV2, ButtonText } from "@/shared/ui/Button/ButtonV2";
import Input from "@/shared/ui/Input/Input";
import ChildSelector from "@/widgets/ChildSelector/ChildSelector";
import type { CreateActivityRequest } from "@daon/shared";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { CustomDateTimePicker } from "@/shared/ui/DateTimePicker/DateTimePicker";
import { z } from "zod/v4";

// 기저귀 교체 폼 스키마
const DiaperFormSchema = z.object({
  childId: z.string().min(1, "아이를 선택해주세요"),
  type: z.enum(["wet", "dirty", "both"]),
  notes: z.string().optional(),
});

type DiaperFormData = z.infer<typeof DiaperFormSchema>;

interface DiaperBottomSheetProps {
  onComplete?: () => void;
}

export function DiaperBottomSheet({ onComplete }: DiaperBottomSheetProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const { activeChild, availableChildren, isLoading } = useActiveChild();
  const createActivityMutation = useCreateActivity();

  const form = useForm<DiaperFormData>({
    resolver: zodResolver(DiaperFormSchema),
    defaultValues: {
      childId: activeChild?.id || "",
      type: "wet",
      notes: "",
    },
  });

  const handleSubmit = async (data: DiaperFormData) => {
    try {
      const activityData: CreateActivityRequest = {
        childId: data.childId,
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
            onComplete?.();
          },
        },
      ]);
    } catch (error) {
      console.error("Failed to create diaper record:", error);
      Alert.alert("오류", "기저귀 교체 기록 저장에 실패했습니다.");
    }
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View className="p-6">
        <Text className="text-xl font-bold mb-4">기저귀 교체</Text>

        {/* 아이 선택 */}
        <View className="mb-4">
          <Text className="text-base font-medium mb-2">아이 선택</Text>
          <Controller
            control={form.control}
            name="childId"
            render={({ field: { onChange, value } }) => (
              <ChildSelector
                childId={value}
                availableChildren={availableChildren}
                onChildSelect={onChange}
                isLoading={isLoading}
              />
            )}
          />
        </View>

        {/* 시간 선택 */}
        <View className="mb-4">
          <CustomDateTimePicker
            value={selectedDate}
            onChange={setSelectedDate}
            mode="datetime"
            label="시간"
          />
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
          <ButtonV2
            variant="outline"
            onPress={() => onComplete?.()}
            className="flex-1"
          >
            <ButtonText>취소</ButtonText>
          </ButtonV2>
          <ButtonV2
            variant="default"
            onPress={form.handleSubmit(handleSubmit)}
            disabled={createActivityMutation.isPending}
            className="flex-1"
          >
            <ButtonText>
              {createActivityMutation.isPending ? "저장 중..." : "저장"}
            </ButtonText>
          </ButtonV2>
        </View>
      </View>
    </ScrollView>
  );
}
