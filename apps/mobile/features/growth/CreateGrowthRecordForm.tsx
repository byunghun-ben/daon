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
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useCreateGrowthRecord } from "../../shared/api/growth/hooks";
import { useActiveChild } from "../../shared/hooks/useActiveChild";
import { useThemedStyles } from "../../shared/lib/hooks/useTheme";
import { createFormStyles } from "../../shared/styles/formStyles";
import { Button, Input } from "../../shared/ui";

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

  const formStyles = useThemedStyles(createFormStyles);
  const styles = useThemedStyles((theme) =>
    StyleSheet.create({
      ...formStyles,
      dateText: {
        fontSize: theme.typography.body1.fontSize,
        color: theme.colors.text,
      },
      measurementCard: {
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.lg,
        borderRadius: theme.borderRadius.lg,
        marginBottom: theme.spacing.md,
      },
      measurementHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: theme.spacing.md,
      },
      measurementIcon: {
        fontSize: 24,
        marginRight: theme.spacing.sm,
      },
      measurementTitle: {
        fontSize: theme.typography.subtitle.fontSize,
        fontWeight: theme.typography.subtitle.fontWeight,
        color: theme.colors.text,
      },
      measurementDescription: {
        fontSize: theme.typography.body2.fontSize,
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.md,
      },
      inputRow: {
        flexDirection: "row",
        alignItems: "flex-end",
        gap: theme.spacing.sm,
      },
      inputContainer: {
        flex: 1,
      },
      unitText: {
        fontSize: theme.typography.body1.fontSize,
        color: theme.colors.textSecondary,
        paddingBottom: theme.spacing.md,
      },
      summaryCard: {
        backgroundColor: `${theme.colors.primary}10`,
        padding: theme.spacing.lg,
        borderRadius: theme.borderRadius.lg,
        borderWidth: 1,
        borderColor: `${theme.colors.primary}30`,
      },
      summaryTitle: {
        fontSize: theme.typography.subtitle.fontSize,
        fontWeight: theme.typography.subtitle.fontWeight,
        color: theme.colors.primary,
        marginBottom: theme.spacing.sm,
      },
      summaryItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: theme.spacing.xs,
      },
      summaryLabel: {
        fontSize: theme.typography.body2.fontSize,
        color: theme.colors.textSecondary,
      },
      summaryValue: {
        fontSize: theme.typography.body2.fontSize,
        fontWeight: "600",
        color: theme.colors.text,
      },
    }),
  );

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
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* 날짜/시간 선택 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>측정 날짜</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateText}>
            📅 {formatDateTime(currentDateTime)}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 아이 나이 정보 */}
      {activeChild && (
        <View style={styles.section}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>측정 시점 정보</Text>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>아이 이름</Text>
              <Text style={styles.summaryValue}>{activeChild.name}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>측정 시 나이</Text>
              <Text style={styles.summaryValue}>{calculateAgeText()}</Text>
            </View>
          </View>
        </View>
      )}

      {/* 몸무게 */}
      <View style={styles.section}>
        <View style={styles.measurementCard}>
          <View style={styles.measurementHeader}>
            <Text style={styles.measurementIcon}>⚖️</Text>
            <Text style={styles.measurementTitle}>몸무게</Text>
          </View>
          <Text style={styles.measurementDescription}>
            아이의 현재 몸무게를 kg 단위로 입력하세요
          </Text>

          <View style={styles.inputRow}>
            <View style={styles.inputContainer}>
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
            <Text style={styles.unitText}>kg</Text>
          </View>
          <Text style={styles.helpText}>
            정확한 측정을 위해 기저귀를 벗긴 상태에서 측정하세요
          </Text>
        </View>
      </View>

      {/* 키 */}
      <View style={styles.section}>
        <View style={styles.measurementCard}>
          <View style={styles.measurementHeader}>
            <Text style={styles.measurementIcon}>📏</Text>
            <Text style={styles.measurementTitle}>키</Text>
          </View>
          <Text style={styles.measurementDescription}>
            아이의 현재 키를 cm 단위로 입력하세요
          </Text>

          <View style={styles.inputRow}>
            <View style={styles.inputContainer}>
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
            <Text style={styles.unitText}>cm</Text>
          </View>
          <Text style={styles.helpText}>
            누워서 측정하거나 키 재는 도구를 사용하세요
          </Text>
        </View>
      </View>

      {/* 머리둘레 */}
      <View style={styles.section}>
        <View style={styles.measurementCard}>
          <View style={styles.measurementHeader}>
            <Text style={styles.measurementIcon}>👶</Text>
            <Text style={styles.measurementTitle}>머리둘레</Text>
          </View>
          <Text style={styles.measurementDescription}>
            아이의 머리둘레를 cm 단위로 입력하세요
          </Text>

          <View style={styles.inputRow}>
            <View style={styles.inputContainer}>
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
            <Text style={styles.unitText}>cm</Text>
          </View>
          <Text style={styles.helpText}>
            머리의 가장 넓은 부분을 줄자로 측정하세요
          </Text>
        </View>
      </View>

      {/* 메모 */}
      <View style={styles.section}>
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
        <View style={styles.section}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>측정 요약</Text>
            {weight && (
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>몸무게</Text>
                <Text style={styles.summaryValue}>{weight} kg</Text>
              </View>
            )}
            {height && (
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>키</Text>
                <Text style={styles.summaryValue}>{height} cm</Text>
              </View>
            )}
            {headCircumference && (
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>머리둘레</Text>
                <Text style={styles.summaryValue}>{headCircumference} cm</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* 저장 버튼 */}
      <View style={styles.submitButton}>
        <Button
          title="성장 기록 저장"
          onPress={form.handleSubmit(handleSubmit)}
          variant="primary"
          disabled={!hasAnyMeasurement()}
          loading={createGrowthRecordMutation.isPending}
        />
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
