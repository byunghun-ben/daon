import { forwardRef, useState, useImperativeHandle, useRef, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import DateTimePicker from "@react-native-community/datetimepicker";
import type { CreateActivityRequest } from "@daon/shared";
import { z } from "zod/v4";
import { useCreateActivity } from "@/shared/api/hooks/useActivities";
import { useActiveChild } from "@/shared/hooks/useActiveChild";
import Button from "@/shared/ui/Button/Button";
import Input from "@/shared/ui/Input/Input";
import { BottomSheet } from "@/shared/ui/BottomSheet/BottomSheet";
import type { BottomSheetModal } from "@gorhom/bottom-sheet";

// 수유 기록 폼 스키마
const FeedingFormSchema = z.object({
  type: z.enum(["breast", "bottle", "solid"]),
  amount: z.number().optional(),
  duration: z.number().optional(),
  notes: z.string().optional(),
});

type FeedingFormData = z.infer<typeof FeedingFormSchema>;

interface FeedingBottomSheetProps {
  onComplete?: () => void;
}

export interface FeedingBottomSheetRef {
  present: () => void;
  dismiss: () => void;
}

export const FeedingBottomSheet = forwardRef<
  FeedingBottomSheetRef,
  FeedingBottomSheetProps
>(({ onComplete }, ref) => {
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [feedingType, setFeedingType] = useState<"breast" | "bottle" | "solid">(
    "bottle",
  );

  const { activeChild } = useActiveChild();
  const createActivityMutation = useCreateActivity();

  const form = useForm<FeedingFormData>({
    resolver: zodResolver(FeedingFormSchema),
    defaultValues: {
      type: "bottle",
      amount: undefined,
      duration: undefined,
      notes: "",
    },
  });

  useImperativeHandle(ref, () => ({
    present: () => bottomSheetRef.current?.present(),
    dismiss: () => bottomSheetRef.current?.dismiss(),
  }));

  const handleClose = useCallback(() => {
    bottomSheetRef.current?.dismiss();
  }, []);

  const handleSubmit = async (data: FeedingFormData) => {
    if (!activeChild) {
      Alert.alert("알림", "아이를 먼저 선택해주세요.");
      return;
    }

    try {
      const activityData: CreateActivityRequest = {
        childId: activeChild.id,
        type: "feeding",
        timestamp: selectedDate.toISOString(),
        data: {
          type: data.type,
          ...(data.amount && { amount: data.amount }),
          ...(data.duration && { duration: data.duration }),
        },
        notes: data.notes || undefined,
      };

      await createActivityMutation.mutateAsync(activityData);

      Alert.alert("성공", "수유 기록이 저장되었습니다.", [
        {
          text: "확인",
          onPress: () => {
            form.reset();
            setSelectedDate(new Date());
            handleClose();
            onComplete?.();
          },
        },
      ]);
    } catch (error) {
      console.error("Failed to create feeding record:", error);
      Alert.alert("오류", "수유 기록 저장에 실패했습니다.");
    }
  };

  return (
    <BottomSheet
      ref={bottomSheetRef}
      snapPoints={["75%"]}
      enablePanDownToClose
      enableDynamicSizing={false}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="px-2 py-4">
          <Text className="text-xl font-bold mb-4">수유 기록</Text>

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
                onChange={(_event, date) => {
                  setShowDatePicker(false);
                  if (date) setSelectedDate(date);
                }}
              />
            )}
          </View>

          {/* 수유 유형 선택 */}
          <View className="mb-4">
            <Text className="text-base font-medium mb-2">수유 방법</Text>
            <Controller
              control={form.control}
              name="type"
              render={({ field: { onChange, value } }) => (
                <View className="flex-row gap-2">
                  <TouchableOpacity
                    onPress={() => {
                      onChange("breast");
                      setFeedingType("breast");
                    }}
                    className={`flex-1 p-3 rounded-lg items-center ${
                      value === "breast" ? "bg-primary" : "bg-gray-100"
                    }`}
                  >
                    <Text
                      className={`font-medium ${
                        value === "breast" ? "text-white" : "text-gray-700"
                      }`}
                    >
                      모유
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      onChange("bottle");
                      setFeedingType("bottle");
                    }}
                    className={`flex-1 p-3 rounded-lg items-center ${
                      value === "bottle" ? "bg-primary" : "bg-gray-100"
                    }`}
                  >
                    <Text
                      className={`font-medium ${
                        value === "bottle" ? "text-white" : "text-gray-700"
                      }`}
                    >
                      분유
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      onChange("solid");
                      setFeedingType("solid");
                    }}
                    className={`flex-1 p-3 rounded-lg items-center ${
                      value === "solid" ? "bg-primary" : "bg-gray-100"
                    }`}
                  >
                    <Text
                      className={`font-medium ${
                        value === "solid" ? "text-white" : "text-gray-700"
                      }`}
                    >
                      이유식
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          </View>

          {/* 양 입력 (분유/이유식) */}
          {(feedingType === "bottle" || feedingType === "solid") && (
            <Controller
              control={form.control}
              name="amount"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={feedingType === "bottle" ? "양 (ml)" : "양 (g)"}
                  value={value?.toString() || ""}
                  onChangeText={(text) => {
                    const num = parseInt(text);
                    onChange(isNaN(num) ? undefined : num);
                  }}
                  placeholder={feedingType === "bottle" ? "120" : "100"}
                  keyboardType="numeric"
                  error={form.formState.errors.amount?.message}
                />
              )}
            />
          )}

          {/* 시간 입력 (모유) */}
          {feedingType === "breast" && (
            <Controller
              control={form.control}
              name="duration"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="수유 시간 (분)"
                  value={value?.toString() || ""}
                  onChangeText={(text) => {
                    const num = parseInt(text);
                    onChange(isNaN(num) ? undefined : num);
                  }}
                  placeholder="15"
                  keyboardType="numeric"
                  error={form.formState.errors.duration?.message}
                />
              )}
            />
          )}

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
            <Button
              title="취소"
              variant="outline"
              onPress={handleClose}
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
      </ScrollView>
    </BottomSheet>
  );
});

FeedingBottomSheet.displayName = "FeedingBottomSheet";