import { useCreateGrowthRecord } from "@/shared/api/growth/hooks/useCreateGrowthRecord";
import { useActiveChild } from "@/shared/hooks/useActiveChild";
import { ButtonV2, ButtonText } from "@/shared/ui/Button/ButtonV2";
import Input from "@/shared/ui/Input/Input";
import {
  CreateGrowthRecordRequestSchema,
  type CreateGrowthRecordRequest,
} from "@daon/shared";
import { zodResolver } from "@hookform/resolvers/zod";
import type { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Alert,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface CreateGrowthRecordFormProps {
  onSuccess: () => void;
}

export const CreateGrowthRecordForm: React.FC<CreateGrowthRecordFormProps> = ({
  onSuccess,
}) => {
  const { activeChild } = useActiveChild();
  const createGrowthRecordMutation = useCreateGrowthRecord();
  const [showDatePicker, setShowDatePicker] = useState(false);

  const form = useForm<CreateGrowthRecordRequest>({
    resolver: zodResolver(CreateGrowthRecordRequestSchema),
    defaultValues: {
      childId: activeChild?.id || "",
      recordedAt: new Date().toISOString(),
      notes: "",
    },
  });

  const handleDateChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }

    if (selectedDate) {
      form.setValue("recordedAt", selectedDate.toISOString());
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateAgeInDays = () => {
    if (!activeChild?.birthDate) return 0;

    const recordedDate = new Date(form.watch("recordedAt"));
    const birthDate = new Date(activeChild.birthDate);
    const diffTime = recordedDate.getTime() - birthDate.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  const calculateAgeText = () => {
    const ageInDays = calculateAgeInDays();

    if (ageInDays < 30) {
      return `${ageInDays}일`;
    } else if (ageInDays < 365) {
      const months = Math.floor(ageInDays / 30);
      const days = ageInDays % 30;
      return days > 0 ? `${months}개월 ${days}일` : `${months}개월`;
    } else {
      const years = Math.floor(ageInDays / 365);
      const remainingDays = ageInDays % 365;
      const months = Math.floor(remainingDays / 30);

      if (months > 0) {
        return `${years}세 ${months}개월`;
      } else {
        return `${years}세`;
      }
    }
  };

  const hasAnyMeasurement = () => {
    const weight = form.watch("weight");
    const height = form.watch("height");
    const headCircumference = form.watch("headCircumference");

    return weight || height || headCircumference;
  };

  const handleSubmit = async (data: CreateGrowthRecordRequest) => {
    if (!activeChild) {
      Alert.alert("오류", "아이를 선택해주세요.");
      return;
    }

    if (!hasAnyMeasurement()) {
      Alert.alert("오류", "최소 하나의 측정값을 입력해주세요.");
      return;
    }

    try {
      await createGrowthRecordMutation.mutateAsync({
        ...data,
        childId: activeChild.id,
      });

      Alert.alert("완료", "성장 기록이 성공적으로 저장되었습니다.", [
        { text: "확인", onPress: onSuccess },
      ]);
    } catch (error) {
      console.error("Create growth record error:", error);
      Alert.alert("오류", "성장 기록 저장 중 오류가 발생했습니다.");
    }
  };

  const currentDateTime = form.watch("recordedAt");
  const weight = form.watch("weight");
  const height = form.watch("height");
  const headCircumference = form.watch("headCircumference");

  return (
    <ScrollView
      className="flex-1 bg-background px-4"
      showsVerticalScrollIndicator={false}
    >
      {/* 날짜/시간 선택 */}
      <View className="mb-6 pt-4">
        <Text className="text-lg font-semibold text-foreground mb-3">
          측정 날짜
        </Text>
        <TouchableOpacity
          className="bg-surface border border-border rounded-lg p-4"
          onPress={() => setShowDatePicker(true)}
        >
          <Text className="text-base text-foreground">
            📅 {formatDateTime(currentDateTime)}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 아이 나이 정보 */}
      {activeChild && (
        <View className="mb-6">
          <View className="bg-primary/10 p-6 rounded-lg border border-primary/20">
            <Text className="text-base font-semibold text-primary mb-2">
              측정 시점 정보
            </Text>
            <View className="flex-row justify-between mb-1">
              <Text className="text-sm text-muted-foreground">아이 이름</Text>
              <Text className="text-sm font-semibold text-foreground">
                {activeChild.name}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-sm text-muted-foreground">
                측정 시 나이
              </Text>
              <Text className="text-sm font-semibold text-foreground">
                {calculateAgeText()}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* 몸무게 */}
      <View className="mb-6">
        <View className="bg-surface p-6 rounded-lg mb-4">
          <View className="flex-row items-center mb-4">
            <Text className="text-2xl mr-2">⚖️</Text>
            <Text className="text-base font-semibold text-foreground">
              몸무게
            </Text>
          </View>
          <Text className="text-sm text-muted-foreground mb-4">
            아이의 현재 몸무게를 kg 단위로 입력하세요
          </Text>

          <View className="flex-row items-end gap-2">
            <View className="flex-1">
              <Controller
                control={form.control}
                name="weight"
                render={({
                  field: { onChange, onBlur, value },
                  fieldState: { error },
                }) => (
                  <Input
                    placeholder="예: 3.5"
                    value={value?.toString() || ""}
                    onChangeText={(text) => {
                      const numValue = parseFloat(text);
                      onChange(isNaN(numValue) ? undefined : numValue);
                    }}
                    onBlur={onBlur}
                    error={error?.message}
                    keyboardType="decimal-pad"
                  />
                )}
              />
            </View>
            <Text className="text-base text-muted-foreground pb-4">kg</Text>
          </View>
          <Text className="text-xs text-muted-foreground mt-2">
            정확한 측정을 위해 기저귀를 벗긴 상태에서 측정하세요
          </Text>
        </View>
      </View>

      {/* 키 */}
      <View className="mb-6">
        <View className="bg-surface p-6 rounded-lg mb-4">
          <View className="flex-row items-center mb-4">
            <Text className="text-2xl mr-2">📏</Text>
            <Text className="text-base font-semibold text-foreground">키</Text>
          </View>
          <Text className="text-sm text-muted-foreground mb-4">
            아이의 현재 키를 cm 단위로 입력하세요
          </Text>

          <View className="flex-row items-end gap-2">
            <View className="flex-1">
              <Controller
                control={form.control}
                name="height"
                render={({
                  field: { onChange, onBlur, value },
                  fieldState: { error },
                }) => (
                  <Input
                    placeholder="예: 50.5"
                    value={value?.toString() || ""}
                    onChangeText={(text) => {
                      const numValue = parseFloat(text);
                      onChange(isNaN(numValue) ? undefined : numValue);
                    }}
                    onBlur={onBlur}
                    error={error?.message}
                    keyboardType="decimal-pad"
                  />
                )}
              />
            </View>
            <Text className="text-base text-muted-foreground pb-4">cm</Text>
          </View>
          <Text className="text-xs text-muted-foreground mt-2">
            누워서 측정하거나 키 재는 도구를 사용하세요
          </Text>
        </View>
      </View>

      {/* 머리둘레 */}
      <View className="mb-6">
        <View className="bg-surface p-6 rounded-lg mb-4">
          <View className="flex-row items-center mb-4">
            <Text className="text-2xl mr-2">👶</Text>
            <Text className="text-base font-semibold text-foreground">
              머리둘레
            </Text>
          </View>
          <Text className="text-sm text-muted-foreground mb-4">
            아이의 머리둘레를 cm 단위로 입력하세요
          </Text>

          <View className="flex-row items-end gap-2">
            <View className="flex-1">
              <Controller
                control={form.control}
                name="headCircumference"
                render={({
                  field: { onChange, onBlur, value },
                  fieldState: { error },
                }) => (
                  <Input
                    placeholder="예: 35.0"
                    value={value?.toString() || ""}
                    onChangeText={(text) => {
                      const numValue = parseFloat(text);
                      onChange(isNaN(numValue) ? undefined : numValue);
                    }}
                    onBlur={onBlur}
                    error={error?.message}
                    keyboardType="decimal-pad"
                  />
                )}
              />
            </View>
            <Text className="text-base text-muted-foreground pb-4">cm</Text>
          </View>
          <Text className="text-xs text-muted-foreground mt-2">
            머리의 가장 넓은 부분을 줄자로 측정하세요
          </Text>
        </View>
      </View>

      {/* 메모 */}
      <View className="mb-6">
        <Controller
          control={form.control}
          name="notes"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="메모 (선택사항)"
              placeholder="측정 관련 특이사항이나 메모를 입력하세요"
              value={value || ""}
              onChangeText={onChange}
              onBlur={onBlur}
              multiline
              numberOfLines={3}
            />
          )}
        />
      </View>

      {/* 측정 요약 */}
      {hasAnyMeasurement() && (
        <View className="mb-6">
          <View className="bg-primary/10 p-6 rounded-lg border border-primary/20">
            <Text className="text-base font-semibold text-primary mb-2">
              측정 요약
            </Text>
            {weight && (
              <View className="flex-row justify-between mb-1">
                <Text className="text-sm text-muted-foreground">몸무게</Text>
                <Text className="text-sm font-semibold text-foreground">
                  {weight} kg
                </Text>
              </View>
            )}
            {height && (
              <View className="flex-row justify-between mb-1">
                <Text className="text-sm text-muted-foreground">키</Text>
                <Text className="text-sm font-semibold text-foreground">
                  {height} cm
                </Text>
              </View>
            )}
            {headCircumference && (
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted-foreground">머리둘레</Text>
                <Text className="text-sm font-semibold text-foreground">
                  {headCircumference} cm
                </Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* 저장 버튼 */}
      <View className="mb-8">
        <ButtonV2
          onPress={form.handleSubmit(handleSubmit)}
          variant="default"
          disabled={!hasAnyMeasurement()}
        >
          <ButtonText>성장 기록 저장</ButtonText>
        </ButtonV2>
      </View>

      {/* 날짜 피커 */}
      {showDatePicker && (
        <DateTimePicker
          value={new Date(currentDateTime)}
          mode="datetime"
          display="default"
          onChange={handleDateChange}
        />
      )}
    </ScrollView>
  );
};
