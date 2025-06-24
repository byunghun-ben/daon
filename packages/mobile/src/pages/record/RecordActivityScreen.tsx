import { type CreateActivityRequest } from "@daon/shared";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  useActivity,
  useCreateActivity,
  useDeleteActivity,
  useUpdateActivity,
} from "../../shared/api/hooks/useActivities";
import { useChildren } from "../../shared/api/hooks/useChildren";
import { SCREEN_PADDING } from "../../shared/config/theme";
import { useThemedStyles } from "../../shared/lib/hooks/useTheme";
import { ActivityFormData, ActivityFormSchema } from "../../shared/types/forms";
import { RecordActivityScreenProps } from "../../shared/types/navigation";
import Button from "../../shared/ui/Button";
import Card from "../../shared/ui/Card";
import Input from "../../shared/ui/Input";

const ACTIVITY_TYPES = [
  { key: "feeding", label: "수유", icon: "🍼" },
  { key: "diaper", label: "기저귀", icon: "👶" },
  { key: "sleep", label: "수면", icon: "😴" },
  { key: "tummy_time", label: "배 뒤집기", icon: "🤸" },
  { key: "custom", label: "기타", icon: "📝" },
] as const;

export default function RecordActivityScreen({
  navigation,
  route,
}: RecordActivityScreenProps) {
  const {
    activityType: initialType,
    childId: initialChildId,
    activityId,
    isEditing = false,
  } = route?.params || {};

  // React Query hooks
  const { data: childrenData, isLoading: childrenLoading } = useChildren();
  const { data: activityData, isLoading: activityLoading } = useActivity(
    activityId || "",
  );
  const createActivityMutation = useCreateActivity();
  const updateActivityMutation = useUpdateActivity();
  const deleteActivityMutation = useDeleteActivity();

  const children = childrenData?.children || [];
  const activity = activityData?.activity || null;

  // React Hook Form
  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ActivityFormData>({
    resolver: zodResolver(ActivityFormSchema),
    defaultValues: {
      childId: initialChildId || "",
      activityType:
        (initialType as
          | "feeding"
          | "diaper"
          | "sleep"
          | "tummy_time"
          | "custom") || "feeding",
      started_at: new Date().toISOString(),
      ended_at: "",
      notes: "",
      metadata: {},
    },
  });

  const watchedChildId = useWatch({ control, name: "childId" });
  const watchedActivityType = useWatch({ control, name: "activityType" });

  const isLoading =
    childrenLoading ||
    activityLoading ||
    createActivityMutation.isPending ||
    updateActivityMutation.isPending ||
    deleteActivityMutation.isPending;

  const styles = useThemedStyles((theme) => ({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      padding: SCREEN_PADDING,
    },
    header: {
      alignItems: "center" as const,
      marginBottom: theme.spacing.xxl,
    },
    title: {
      fontSize: theme.typography.title.fontSize,
      fontWeight: theme.typography.title.fontWeight,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.sm,
    },
    subtitle: {
      fontSize: theme.typography.subtitle.fontSize,
      color: theme.colors.text.secondary,
      textAlign: "center" as const,
    },
    section: {
      marginBottom: theme.spacing.xl,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "600" as const,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.md,
    },
    childSelector: {
      flexDirection: "row" as const,
      flexWrap: "wrap" as const,
      gap: theme.spacing.sm,
    },
    childButton: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    childButtonSelected: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    childButtonText: {
      fontSize: theme.typography.body2.fontSize,
      color: theme.colors.text.primary,
    },
    childButtonTextSelected: {
      color: theme.colors.surface,
    },
    activityTypes: {
      flexDirection: "row" as const,
      flexWrap: "wrap" as const,
      gap: theme.spacing.sm,
    },
    activityButton: {
      flex: 1,
      minWidth: "45%",
      aspectRatio: 1.5,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 2,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      alignItems: "center" as const,
      justifyContent: "center" as const,
    },
    activityButtonSelected: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primary + "10",
    },
    activityIcon: {
      fontSize: 32,
      marginBottom: theme.spacing.xs,
    },
    activityLabel: {
      fontSize: theme.typography.body2.fontSize,
      fontWeight: "600" as const,
      color: theme.colors.text.primary,
      textAlign: "center" as const,
    },
    timeContainer: {
      flexDirection: "row" as const,
      gap: theme.spacing.md,
    },
    timeInput: {
      flex: 1,
    },
    metadataContainer: {
      marginTop: theme.spacing.md,
    },
  }));

  // Initialize form data when activity data is loaded (for editing)
  useEffect(() => {
    if (activity && isEditing) {
      reset({
        childId: activity.childId,
        activityType: activity.type,
        started_at: activity.timestamp,
        ended_at: "",
        notes: activity.notes || "",
        metadata: {},
      });
    }
  }, [activity, isEditing, reset]);

  // Auto-select child if only one exists
  useEffect(() => {
    if (!watchedChildId && children.length === 1) {
      setValue("childId", children[0].id);
    }
  }, [children, watchedChildId, setValue]);

  const formatDateTime = (date: Date): string => {
    return date.toISOString().slice(0, 16); // YYYY-MM-DDTHH:mm
  };

  const onSubmit = async (data: ActivityFormData) => {
    try {
      if (isEditing && activityId) {
        // Update existing activity
        const updateData = {
          started_at: data.started_at,
          ended_at: data.ended_at || undefined,
          notes: data.notes || undefined,
          metadata: data.metadata,
        };

        await updateActivityMutation.mutateAsync({
          id: activityId,
          data: updateData,
        });

        Alert.alert("성공", "활동이 업데이트되었습니다!", [
          { text: "확인", onPress: () => navigation.goBack() },
        ]);
      } else {
        // Create new activity
        const activityData: CreateActivityRequest = {
          childId: data.childId,
          type: data.activityType as any,
          timestamp: data.started_at,
          data: data.metadata || {},
          notes: data.notes || undefined,
        };

        await createActivityMutation.mutateAsync(activityData);

        Alert.alert("성공", "활동이 기록되었습니다!", [
          { text: "확인", onPress: () => navigation.goBack() },
        ]);
      }
    } catch (error: any) {
      Alert.alert("오류", error.message || "활동 기록 중 오류가 발생했습니다.");
    }
  };

  const handleDelete = async () => {
    if (!isEditing || !activityId) return;

    Alert.alert("활동 삭제", "이 활동 기록을 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteActivityMutation.mutateAsync(activityId);
            Alert.alert("삭제 완료", "활동이 삭제되었습니다.", [
              { text: "확인", onPress: () => navigation.goBack() },
            ]);
          } catch (error) {
            Alert.alert("오류", "삭제 중 오류가 발생했습니다.");
          }
        },
      },
    ]);
  };

  const renderMetadataInputs = () => {
    switch (watchedActivityType) {
      case "feeding":
        return (
          <View style={styles.metadataContainer}>
            <Controller
              control={control}
              name="metadata"
              render={({ field: { value, onChange } }) => (
                <>
                  <Input
                    label="수유량 (ml)"
                    value={value?.amount?.toString() || ""}
                    onChangeText={(amount) =>
                      onChange({
                        ...value,
                        amount: amount ? parseInt(amount) : undefined,
                      })
                    }
                    keyboardType="numeric"
                    placeholder="예: 120"
                  />
                  <Input
                    label="수유 종류"
                    value={value?.type || ""}
                    onChangeText={(type) => onChange({ ...value, type })}
                    placeholder="예: 모유, 분유, 이유식"
                  />
                </>
              )}
            />
          </View>
        );

      case "diaper":
        return (
          <View style={styles.metadataContainer}>
            <Controller
              control={control}
              name="metadata"
              render={({ field: { value, onChange } }) => (
                <Input
                  label="기저귀 상태"
                  value={value?.type || ""}
                  onChangeText={(type) => onChange({ ...value, type })}
                  placeholder="예: 소변, 대변, 소변+대변"
                />
              )}
            />
          </View>
        );

      case "sleep":
        return (
          <View style={styles.metadataContainer}>
            <Controller
              control={control}
              name="metadata"
              render={({ field: { value, onChange } }) => (
                <Input
                  label="수면 품질"
                  value={value?.quality || ""}
                  onChangeText={(quality) => onChange({ ...value, quality })}
                  placeholder="예: 좋음, 보통, 나쁨"
                />
              )}
            />
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {isEditing ? "활동 수정" : "활동 기록"}
          </Text>
          <Text style={styles.subtitle}>
            {isEditing
              ? "활동 정보를 수정하세요"
              : "아이의 일상 활동을 기록해보세요"}
          </Text>
        </View>

        {/* Child Selection */}
        {!isEditing && (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>아이 선택</Text>
            <Controller
              control={control}
              name="childId"
              render={({ field: { value, onChange } }) => (
                <View style={styles.childSelector}>
                  {children.map((child) => (
                    <TouchableOpacity
                      key={child.id}
                      style={[
                        styles.childButton,
                        value === child.id && styles.childButtonSelected,
                      ]}
                      onPress={() => onChange(child.id)}
                    >
                      <Text
                        style={[
                          styles.childButtonText,
                          value === child.id && styles.childButtonTextSelected,
                        ]}
                      >
                        {child.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            />
            {errors.childId && (
              <Text style={{ color: "red" }}>{errors.childId.message}</Text>
            )}
          </Card>
        )}

        {isEditing && (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>아이</Text>
            <Text style={{ fontSize: 16, color: "#666" }}>
              {children.find((c) => c.id === watchedChildId)?.name ||
                "로딩 중..."}
            </Text>
          </Card>
        )}

        {/* Activity Type Selection */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>활동 유형</Text>
          {isEditing ? (
            <View style={{ alignItems: "center", padding: 16 }}>
              <Text style={styles.activityIcon}>
                {ACTIVITY_TYPES.find((a) => a.key === watchedActivityType)
                  ?.icon || "📝"}
              </Text>
              <Text style={styles.activityLabel}>
                {ACTIVITY_TYPES.find((a) => a.key === watchedActivityType)
                  ?.label || watchedActivityType}
              </Text>
            </View>
          ) : (
            <Controller
              control={control}
              name="activityType"
              render={({ field: { value, onChange } }) => (
                <>
                  <View style={styles.activityTypes}>
                    {ACTIVITY_TYPES.map((activity) => (
                      <TouchableOpacity
                        key={activity.key}
                        style={[
                          styles.activityButton,
                          value === activity.key &&
                            styles.activityButtonSelected,
                        ]}
                        onPress={() => onChange(activity.key)}
                      >
                        <Text style={styles.activityIcon}>{activity.icon}</Text>
                        <Text style={styles.activityLabel}>
                          {activity.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  {errors.activityType && (
                    <Text style={{ color: "red" }}>
                      {errors.activityType.message}
                    </Text>
                  )}
                </>
              )}
            />
          )}
        </Card>

        {/* Time Input */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>시간</Text>
          <View style={styles.timeContainer}>
            <Controller
              control={control}
              name="started_at"
              render={({ field: { value, onChange } }) => (
                <Input
                  label="시작 시간"
                  value={formatDateTime(new Date(value))}
                  onChangeText={(started_at) =>
                    onChange(new Date(started_at).toISOString())
                  }
                  containerStyle={styles.timeInput}
                  error={errors.started_at?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="ended_at"
              render={({ field: { value, onChange } }) => (
                <Input
                  label="종료 시간 (선택사항)"
                  value={value ? formatDateTime(new Date(value)) : ""}
                  onChangeText={(ended_at) =>
                    onChange(ended_at ? new Date(ended_at).toISOString() : "")
                  }
                  containerStyle={styles.timeInput}
                  error={errors.ended_at?.message}
                />
              )}
            />
          </View>
        </Card>

        {/* Activity-specific metadata */}
        {watchedActivityType && (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>세부 정보</Text>
            {renderMetadataInputs()}
          </Card>
        )}

        {/* Notes */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>메모</Text>
          <Controller
            control={control}
            name="notes"
            render={({ field: { value, onChange } }) => (
              <Input
                label="추가 메모 (선택사항)"
                value={value || ""}
                onChangeText={onChange}
                multiline
                numberOfLines={3}
                placeholder="특이사항이나 추가 정보를 입력하세요"
              />
            )}
          />
        </Card>

        {/* Action Buttons */}
        <Button
          title={
            isLoading
              ? "저장 중..."
              : isEditing
                ? "활동 업데이트"
                : "활동 기록 저장"
          }
          onPress={handleSubmit(onSubmit)}
          disabled={isLoading}
        />

        {isEditing && (
          <Button
            title="활동 삭제"
            variant="outline"
            onPress={handleDelete}
            disabled={isLoading}
            buttonStyle={{ marginTop: 12 }}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
