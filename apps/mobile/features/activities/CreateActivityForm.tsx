import {
  CreateActivityRequestSchema,
  type CreateActivityRequest,
} from "@daon/shared";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { useCreateActivity } from "../../shared/api/hooks/useActivities";
import { useActiveChild } from "../../shared/hooks/useActiveChild";
import { cn } from "../../shared/lib/utils/cn";
import Button from "../../shared/ui/Button/Button";
import Input from "../../shared/ui/Input/Input";
import ChildSelector from "../../widgets/ChildSelector/ChildSelector";

type ActivityType = "feeding" | "diaper" | "sleep" | "tummy_time" | "custom";

interface CreateActivityFormProps {
  onSuccess: () => void;
}

export const CreateActivityForm: React.FC<CreateActivityFormProps> = ({
  onSuccess,
}) => {
  const { activeChild } = useActiveChild();
  const createActivityMutation = useCreateActivity();
  const [selectedActivityType, setSelectedActivityType] =
    useState<ActivityType>("feeding");
  const [showDatePicker, setShowDatePicker] = useState(false);

  const form = useForm<CreateActivityRequest>({
    resolver: zodResolver(CreateActivityRequestSchema),
    defaultValues: {
      childId: activeChild?.id || "",
      type: "feeding",
      timestamp: new Date().toISOString(),
      data: {},
      notes: "",
    },
  });

  const activityTypes = [
    { key: "feeding", label: "수유", icon: "🍼" },
    { key: "diaper", label: "기저귀", icon: "👶" },
    { key: "sleep", label: "수면", icon: "😴" },
    { key: "tummy_time", label: "배밀이", icon: "🤸‍♀️" },
    { key: "custom", label: "기타", icon: "📝" },
  ] as const;

  const handleActivityTypeChange = (type: ActivityType) => {
    setSelectedActivityType(type);
    form.setValue("type", type);
    // 타입이 변경되면 data 초기화
    form.resetField("data");
  };

  const handleDateTimeChange = (_event: unknown, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }

    if (selectedDate) {
      form.setValue("timestamp", selectedDate.toISOString());
    }
  };

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleSubmit = async (data: CreateActivityRequest) => {
    if (!activeChild) {
      Alert.alert("오류", "아이를 선택해주세요.");
      return;
    }

    try {
      await createActivityMutation.mutateAsync({
        ...data,
        childId: activeChild.id,
      });

      Alert.alert("완료", "활동이 성공적으로 기록되었습니다.", [
        { text: "확인", onPress: onSuccess },
      ]);
    } catch (error) {
      console.error("Create activity error:", error);
      Alert.alert("오류", "활동 기록 중 오류가 발생했습니다.");
    }
  };

  const currentTimestamp = form.watch("timestamp");

  return (
    <ScrollView
      className="flex-1 bg-background px-4"
      showsVerticalScrollIndicator={false}
    >
      {/* 아이 선택 */}
      <View className="mb-6 pt-4">
        <Text className="text-lg font-semibold text-foreground mb-3">
          아이 선택
        </Text>
        <ChildSelector />
      </View>

      {/* 활동 유형 선택 */}
      <View className="mb-6">
        <Text className="text-lg font-semibold text-foreground mb-3">
          활동 유형
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {activityTypes.map((activity) => (
            <TouchableOpacity
              key={activity.key}
              className={cn(
                "flex-1 min-w-[45%] py-4 px-3 rounded-lg border-2 border-border items-center bg-surface",
                selectedActivityType === activity.key &&
                  "border-primary bg-primary/10",
              )}
              onPress={() => handleActivityTypeChange(activity.key)}
            >
              <Text className="text-2xl mb-1">{activity.icon}</Text>
              <Text
                className={cn(
                  "text-sm text-foreground text-center",
                  selectedActivityType === activity.key &&
                    "text-primary font-semibold",
                )}
              >
                {activity.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 날짜 및 시간 */}
      <View className="mb-6">
        <Text className="text-lg font-semibold text-foreground mb-3">
          날짜 및 시간
        </Text>
        <TouchableOpacity
          className="bg-surface border border-border rounded-lg p-4"
          onPress={() => setShowDatePicker(true)}
        >
          <Text className="text-base text-foreground">
            📅 {formatDateTime(currentTimestamp || new Date().toISOString())}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 메모 */}
      <View className="mb-6">
        <Controller
          control={form.control}
          name="notes"
          render={({
            field: { onChange, onBlur, value },
            fieldState: { error },
          }) => (
            <Input
              label="메모 (선택사항)"
              placeholder="추가 정보를 입력하세요"
              value={value || ""}
              onChangeText={onChange}
              onBlur={onBlur}
              error={error?.message}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          )}
        />
      </View>

      {/* 저장 버튼 */}
      <View className="mb-8">
        <Button
          title="활동 저장"
          onPress={form.handleSubmit(handleSubmit)}
          variant="primary"
          loading={createActivityMutation.isPending}
        />
      </View>

      {/* 날짜 시간 피커 */}
      {showDatePicker && (
        <DateTimePicker
          value={new Date(currentTimestamp || new Date().toISOString())}
          mode="datetime"
          display="default"
          onChange={handleDateTimeChange}
        />
      )}
    </ScrollView>
  );
};
