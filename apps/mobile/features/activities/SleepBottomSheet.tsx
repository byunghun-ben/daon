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

// 수면 기록 폼 스키마
const SleepFormSchema = z.object({
  childId: z.string().min(1, "아이를 선택해주세요"),
  duration: z.number().min(1, "수면 시간을 입력해주세요"),
  quality: z.enum(["good", "normal", "bad"]).optional(),
  notes: z.string().optional(),
});

type SleepFormData = z.infer<typeof SleepFormSchema>;

interface SleepBottomSheetProps {
  onComplete?: () => void;
}

export function SleepBottomSheet({ onComplete }: SleepBottomSheetProps) {
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());

  const { activeChild, availableChildren, isLoading } = useActiveChild();
  const createActivityMutation = useCreateActivity();

  const form = useForm<SleepFormData>({
    resolver: zodResolver(SleepFormSchema),
    defaultValues: {
      childId: activeChild?.id || "",
      quality: "normal",
      notes: "",
    },
  });

  // 수면 시간 계산 (분 단위)
  const calculateDuration = () => {
    const diff = endTime.getTime() - startTime.getTime();
    return Math.round(diff / 1000 / 60); // 분 단위로 변환
  };

  const handleSubmit = async (data: SleepFormData) => {
    if (endTime <= startTime) {
      Alert.alert("알림", "종료 시간은 시작 시간보다 늦어야 합니다.");
      return;
    }

    try {
      const duration = calculateDuration();
      const activityData: CreateActivityRequest = {
        childId: data.childId,
        type: "sleep",
        timestamp: startTime.toISOString(),
        data: {
          duration,
          ...(data.quality && { quality: data.quality }),
        },
        notes: data.notes || undefined,
      };

      await createActivityMutation.mutateAsync(activityData);

      Alert.alert("성공", "수면 기록이 저장되었습니다.", [
        {
          text: "확인",
          onPress: () => {
            form.reset();
            setStartTime(new Date());
            setEndTime(new Date());
            onComplete?.();
          },
        },
      ]);
    } catch (error) {
      console.error("Failed to create sleep record:", error);
      Alert.alert("오류", "수면 기록 저장에 실패했습니다.");
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}시간 ${mins}분`;
    }
    return `${mins}분`;
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View className="p-6 gap-6">
        <Text className="text-xl font-bold mb-4">수면 기록</Text>

        {/* 아이 선택 */}
        <View>
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

        {/* 시작 시간 */}
        <CustomDateTimePicker
          value={startTime}
          onChange={(date) => {
            setStartTime(date);
            // 자동으로 duration 계산
            const duration = calculateDuration();
            form.setValue("duration", duration);
          }}
          mode="datetime"
          label="시작 시간"
        />

        {/* 종료 시간 */}
        <CustomDateTimePicker
          value={endTime}
          onChange={(date) => {
            setEndTime(date);
            // 자동으로 duration 계산
            const duration = calculateDuration();
            form.setValue("duration", duration);
          }}
          mode="datetime"
          label="종료 시간"
        />

        {/* 수면 시간 표시 */}
        <View className="bg-blue-50 p-4 rounded-lg">
          <Text className="text-sm text-gray-600">총 수면 시간</Text>
          <Text className="text-lg font-bold text-blue-600">
            {formatDuration(calculateDuration())}
          </Text>
        </View>

        {/* 수면 질 선택 */}
        <View>
          <Text className="text-base font-medium mb-2">수면의 질</Text>
          <Controller
            control={form.control}
            name="quality"
            render={({ field: { onChange, value } }) => (
              <View className="flex-row gap-2">
                <TouchableOpacity
                  onPress={() => onChange("good")}
                  className={`flex-1 p-3 rounded-lg items-center ${
                    value === "good" ? "bg-green-500" : "bg-gray-100"
                  }`}
                >
                  <Text
                    className={`font-medium ${
                      value === "good" ? "text-white" : "text-gray-700"
                    }`}
                  >
                    😊 좋음
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => onChange("normal")}
                  className={`flex-1 p-3 rounded-lg items-center ${
                    value === "normal" ? "bg-yellow-500" : "bg-gray-100"
                  }`}
                >
                  <Text
                    className={`font-medium ${
                      value === "normal" ? "text-white" : "text-gray-700"
                    }`}
                  >
                    😐 보통
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => onChange("bad")}
                  className={`flex-1 p-3 rounded-lg items-center ${
                    value === "bad" ? "bg-red-500" : "bg-gray-100"
                  }`}
                >
                  <Text
                    className={`font-medium ${
                      value === "bad" ? "text-white" : "text-gray-700"
                    }`}
                  >
                    😔 나쁨
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
              placeholder="특이사항을 입력하세요"
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
