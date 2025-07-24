import { useUpdateChild } from "@/shared/api/hooks/useChildren";
import { ButtonText, ButtonV2 } from "@/shared/ui/Button/ButtonV2";
import { CustomDateTimePicker } from "@/shared/ui/DateTimePicker/DateTimePicker";
import Input from "@/shared/ui/Input/Input";
import type { ChildApi } from "@daon/shared";
import { UpdateChildRequestSchema } from "@daon/shared";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import type { z } from "zod/v4";

type UpdateChildFormData = z.infer<typeof UpdateChildRequestSchema>;

interface EditChildBottomSheetProps {
  child: ChildApi;
  onComplete?: () => void;
}

export function EditChildBottomSheet({
  child,
  onComplete,
}: EditChildBottomSheetProps) {
  const [selectedDate, setSelectedDate] = useState(new Date(child.birthDate));
  const updateChildMutation = useUpdateChild();

  const form = useForm<UpdateChildFormData>({
    resolver: zodResolver(UpdateChildRequestSchema),
    defaultValues: {
      name: child.name,
      gender: child.gender,
      birthDate: child.birthDate,
      birthWeight: child.birthWeight || undefined,
      birthHeight: child.birthHeight || undefined,
    },
  });

  const handleSubmit = async (data: UpdateChildFormData) => {
    try {
      // 날짜를 ISO 문자열로 변환
      const updateData = {
        ...data,
        birthDate: selectedDate.toISOString().split("T")[0], // YYYY-MM-DD 형식
      };

      await updateChildMutation.mutateAsync({
        id: child.id,
        data: updateData,
      });

      Alert.alert("성공", "아이 정보가 성공적으로 수정되었습니다.", [
        {
          text: "확인",
          onPress: () => {
            onComplete?.();
          },
        },
      ]);
    } catch (error) {
      console.error("Failed to update child:", error);
      Alert.alert("오류", "아이 정보 수정에 실패했습니다.");
    }
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View className="p-6 gap-6">
        <Text className="text-xl font-bold mb-4">{child.name} 정보 수정</Text>

        {/* 이름 */}
        <Controller
          control={form.control}
          name="name"
          render={({ field: { onChange, value } }) => (
            <Input
              label="이름 *"
              value={value}
              onChangeText={onChange}
              placeholder="아이 이름을 입력하세요"
              error={form.formState.errors.name?.message}
            />
          )}
        />

        {/* 생년월일 */}
        <CustomDateTimePicker
          value={selectedDate}
          onChange={(date) => {
            setSelectedDate(date);
            form.setValue("birthDate", date.toISOString().split("T")[0]);
          }}
          mode="date"
          label="생년월일 *"
        />

        {/* 성별 선택 */}
        <View>
          <Text className="text-base font-medium mb-2 text-text">성별</Text>
          <Controller
            control={form.control}
            name="gender"
            render={({ field: { onChange, value } }) => (
              <View className="flex-row gap-2">
                <TouchableOpacity
                  onPress={() => onChange("male")}
                  className={`flex-1 p-3 rounded-lg items-center ${
                    value === "male" ? "bg-blue-500" : "bg-gray-100"
                  }`}
                >
                  <Text
                    className={`font-medium ${
                      value === "male" ? "text-white" : "text-gray-700"
                    }`}
                  >
                    👦 남아
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => onChange("female")}
                  className={`flex-1 p-3 rounded-lg items-center ${
                    value === "female" ? "bg-pink-500" : "bg-gray-100"
                  }`}
                >
                  <Text
                    className={`font-medium ${
                      value === "female" ? "text-white" : "text-gray-700"
                    }`}
                  >
                    👧 여아
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => onChange(null)}
                  className={`flex-1 p-3 rounded-lg items-center ${
                    value !== null ? "bg-gray-100" : "bg-gray-500"
                  }`}
                >
                  <Text
                    className={`font-medium ${
                      value !== null ? "text-gray-700" : "text-white"
                    }`}
                  >
                    🤷 선택 안함
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          />
        </View>

        {/* 출생 정보 */}
        <View className="bg-gray-50 p-4 rounded-lg">
          <Text className="text-base font-medium mb-4 text-text">
            출생 정보 (선택사항)
          </Text>

          {/* 출생 체중 */}
          <View className="mb-4">
            <Controller
              control={form.control}
              name="birthWeight"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="출생 체중 (g)"
                  value={value?.toString() || ""}
                  onChangeText={(text) => {
                    const num = parseFloat(text);
                    onChange(isNaN(num) ? undefined : num);
                  }}
                  placeholder="3200"
                  keyboardType="numeric"
                  error={form.formState.errors.birthWeight?.message}
                />
              )}
            />
          </View>

          {/* 출생 신장 */}
          <Controller
            control={form.control}
            name="birthHeight"
            render={({ field: { onChange, value } }) => (
              <Input
                label="출생 신장 (cm)"
                value={value?.toString() || ""}
                onChangeText={(text) => {
                  const num = parseFloat(text);
                  onChange(isNaN(num) ? undefined : num);
                }}
                placeholder="50"
                keyboardType="numeric"
                error={form.formState.errors.birthHeight?.message}
              />
            )}
          />
        </View>

        {/* 버튼 */}
        <View className="flex-row gap-3 mt-6">
          <ButtonV2
            variant="outline"
            onPress={() => onComplete?.()}
            className="flex-1"
            disabled={updateChildMutation.isPending}
          >
            <ButtonText>취소</ButtonText>
          </ButtonV2>
          <ButtonV2
            variant="default"
            onPress={form.handleSubmit(handleSubmit)}
            disabled={updateChildMutation.isPending}
            className="flex-1"
          >
            <ButtonText>
              {updateChildMutation.isPending ? "저장 중..." : "저장"}
            </ButtonText>
          </ButtonV2>
        </View>
      </View>
    </ScrollView>
  );
}
