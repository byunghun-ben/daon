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
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useCreateActivity } from "../../shared/api/hooks/useActivities";
import { useActiveChild } from "../../shared/hooks/useActiveChild";
import { useThemedStyles } from "../../shared/lib/hooks/useTheme";
import { createFormStyles } from "../../shared/styles/formStyles";
import { Button, Input } from "../../shared/ui";

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

  const formStyles = useThemedStyles(createFormStyles);
  const styles = useThemedStyles((theme) =>
    StyleSheet.create({
      ...formStyles,
      fieldGroup: {
        marginBottom: theme.spacing.md,
      },
      activityTypeGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: theme.spacing.sm,
      },
      activityTypeButton: {
        flex: 1,
        minWidth: "45%",
        paddingVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.sm,
        borderRadius: theme.borderRadius.md,
        borderWidth: 2,
        borderColor: theme.colors.border,
        alignItems: "center",
        backgroundColor: theme.colors.surface,
      },
      activeActivityTypeButton: {
        borderColor: theme.colors.primary,
        backgroundColor: `${theme.colors.primary}20`,
      },
      activityTypeIcon: {
        fontSize: 24,
        marginBottom: theme.spacing.xs,
      },
      activityTypeText: {
        fontSize: theme.typography.body2.fontSize,
        color: theme.colors.text,
        textAlign: "center",
      },
      activeActivityTypeText: {
        color: theme.colors.primary,
        fontWeight: "600",
      },
      buttonGroup: {
        flexDirection: "row",
        gap: theme.spacing.sm,
        marginBottom: theme.spacing.md,
      },
      optionButton: {
        flex: 1,
        paddingVertical: theme.spacing.sm,
        paddingHorizontal: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
        alignItems: "center",
        backgroundColor: theme.colors.surface,
      },
      activeOptionButton: {
        borderColor: theme.colors.primary,
        backgroundColor: theme.colors.primary,
      },
      optionButtonText: {
        fontSize: theme.typography.body2.fontSize,
        color: theme.colors.text,
      },
      activeOptionButtonText: {
        color: theme.colors.white,
        fontWeight: "600",
      },
      dateText: {
        fontSize: theme.typography.body1.fontSize,
        color: theme.colors.text,
      },
    }),
  );

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
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* 활동 유형 선택 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>활동 유형</Text>
        <View style={styles.activityTypeGrid}>
          {activityTypes.map((activity) => (
            <TouchableOpacity
              key={activity.key}
              style={[
                styles.activityTypeButton,
                selectedActivityType === activity.key &&
                  styles.activeActivityTypeButton,
              ]}
              onPress={() => handleActivityTypeChange(activity.key)}
            >
              <Text style={styles.activityTypeIcon}>{activity.icon}</Text>
              <Text
                style={[
                  styles.activityTypeText,
                  selectedActivityType === activity.key &&
                    styles.activeActivityTypeText,
                ]}
              >
                {activity.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 날짜 및 시간 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>날짜 및 시간</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateText}>
            📅 {formatDateTime(currentTimestamp || new Date().toISOString())}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 메모 */}
      <View style={styles.section}>
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
      <View style={styles.submitButton}>
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
