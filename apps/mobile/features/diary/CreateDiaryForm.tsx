import {
  CreateDiaryEntryRequestSchema,
  type CreateDiaryEntryRequest,
  type CreateMilestoneRequest,
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
import { useCreateDiaryEntry } from "../../shared/api/diary/hooks";
import { useThemedStyles } from "../../shared/lib/hooks/useTheme";
import { useActiveChild } from "../../shared/hooks/useActiveChild";
import { Button, Input, ImageUploader } from "../../shared/ui";

interface CreateDiaryFormProps {
  onSuccess: () => void;
}

export const CreateDiaryForm: React.FC<CreateDiaryFormProps> = ({
  onSuccess,
}) => {
  const { activeChild } = useActiveChild();
  const createDiaryMutation = useCreateDiaryEntry();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [milestones, setMilestones] = useState<CreateMilestoneRequest[]>([]);
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);

  const form = useForm({
    resolver: zodResolver(CreateDiaryEntryRequestSchema),
    defaultValues: {
      childId: activeChild?.id || "",
      date: new Date().toISOString().split("T")[0],
      content: "",
      photos: [],
      videos: [],
      milestones: [],
    },
  });

  const styles = useThemedStyles((theme) => ({
    container: {
      flex: 1,
      padding: theme.spacing.lg,
    },
    section: {
      marginBottom: theme.spacing.xl,
    },
    sectionTitle: {
      fontSize: theme.typography.subtitle.fontSize,
      fontWeight: theme.typography.subtitle.fontWeight,
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
    },
    dateButton: {
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    dateText: {
      fontSize: theme.typography.body1.fontSize,
      color: theme.colors.text,
    },
    photoContainer: {
      flexDirection: "row" as const,
      flexWrap: "wrap" as const,
      gap: theme.spacing.sm,
    },
    photoButton: {
      width: 100,
      height: 100,
      borderRadius: theme.borderRadius.md,
      borderWidth: 2,
      borderStyle: "dashed" as const,
      borderColor: theme.colors.border,
      justifyContent: "center" as const,
      alignItems: "center" as const,
      backgroundColor: theme.colors.surface,
    },
    photoButtonText: {
      fontSize: theme.typography.body2.fontSize,
      color: theme.colors.textSecondary,
      textAlign: "center" as const,
    },
    photoPreview: {
      width: 100,
      height: 100,
      borderRadius: theme.borderRadius.md,
      position: "relative" as const,
    },
    photoImage: {
      width: "100%",
      height: "100%",
      borderRadius: theme.borderRadius.md,
    },
    removePhotoButton: {
      position: "absolute" as const,
      top: -5,
      right: -5,
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: theme.colors.error,
      justifyContent: "center" as const,
      alignItems: "center" as const,
    },
    removePhotoText: {
      color: theme.colors.white,
      fontSize: 12,
      fontWeight: "bold" as const,
    },
    milestoneSection: {
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      marginBottom: theme.spacing.md,
    },
    milestoneHeader: {
      flexDirection: "row" as const,
      justifyContent: "space-between" as const,
      alignItems: "center" as const,
      marginBottom: theme.spacing.md,
    },
    milestoneTitle: {
      fontSize: theme.typography.subtitle.fontSize,
      fontWeight: theme.typography.subtitle.fontWeight,
      color: theme.colors.text,
    },
    addMilestoneButton: {
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.borderRadius.sm,
      backgroundColor: theme.colors.primary,
    },
    addMilestoneText: {
      color: theme.colors.white,
      fontSize: theme.typography.body2.fontSize,
      fontWeight: "600" as const,
    },
    milestoneItem: {
      padding: theme.spacing.md,
      backgroundColor: theme.colors.background,
      borderRadius: theme.borderRadius.sm,
      marginBottom: theme.spacing.sm,
    },
    milestoneItemTitle: {
      fontSize: theme.typography.body1.fontSize,
      fontWeight: "600" as const,
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
    },
    milestoneItemDescription: {
      fontSize: theme.typography.body2.fontSize,
      color: theme.colors.textSecondary,
    },
    submitButton: {
      marginTop: theme.spacing.xl,
    },
    removeButton: {
      color: theme.colors.error,
      fontSize: 18,
    },
  }));

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }

    if (selectedDate) {
      const dateString = selectedDate.toISOString().split("T")[0];
      form.setValue("date", dateString);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const addMilestone = () => {
    const newMilestone: CreateMilestoneRequest = {
      type: "custom",
      title: "",
      description: "",
      achievedAt: new Date().toISOString(),
      childId: activeChild?.id || "",
    };

    Alert.prompt(
      "마일스톤 추가",
      "마일스톤 제목을 입력하세요",
      [
        {
          text: "취소",
          style: "cancel",
        },
        {
          text: "추가",
          onPress: (title) => {
            if (title && title.trim()) {
              const milestone = { ...newMilestone, title: title.trim() };
              const updatedMilestones = [...milestones, milestone];
              setMilestones(updatedMilestones);
              form.setValue("milestones", updatedMilestones);
            }
          },
        },
      ],
      "plain-text",
    );
  };

  const removeMilestone = (index: number) => {
    const updatedMilestones = milestones.filter((_, i) => i !== index);
    setMilestones(updatedMilestones);
    form.setValue("milestones", updatedMilestones);
  };

  const handleSubmit = form.handleSubmit(
    async (data: CreateDiaryEntryRequest) => {
      if (!activeChild) {
        Alert.alert("오류", "아이를 선택해주세요.");
        return;
      }

      try {
        await createDiaryMutation.mutateAsync({
          ...data,
          childId: activeChild.id,
        });

        Alert.alert("완료", "일기가 성공적으로 저장되었습니다.", [
          { text: "확인", onPress: onSuccess },
        ]);
      } catch (error) {
        console.error("Create diary error:", error);
        Alert.alert("오류", "일기 저장 중 오류가 발생했습니다.");
      }
    },
  );

  const currentDate = form.watch("date");

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* 날짜 선택 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>날짜</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateText}>📅 {formatDate(currentDate)}</Text>
        </TouchableOpacity>
      </View>

      {/* 일기 내용 */}
      <View style={styles.section}>
        <Controller
          control={form.control}
          name="content"
          rules={{ required: "일기 내용을 입력해주세요" }}
          render={({
            field: { onChange, onBlur, value },
            fieldState: { error },
          }) => (
            <Input
              label="일기 내용"
              placeholder="오늘 아이와 함께한 특별한 순간을 기록해보세요"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={error?.message}
              multiline
              numberOfLines={8}
              textAlignVertical="top"
            />
          )}
        />
      </View>

      {/* 사진 추가 */}
      <View style={styles.section}>
        <ImageUploader
          images={selectedImages}
          onImagesChange={(images) => {
            setSelectedImages(images);
            form.setValue("photos", images);
          }}
          maxImages={5}
          disabled={createDiaryMutation.isPending}
        />
      </View>

      {/* 마일스톤 */}
      <View style={styles.section}>
        <View style={styles.milestoneSection}>
          <View style={styles.milestoneHeader}>
            <Text style={styles.milestoneTitle}>마일스톤</Text>
            <TouchableOpacity
              style={styles.addMilestoneButton}
              onPress={addMilestone}
            >
              <Text style={styles.addMilestoneText}>+ 추가</Text>
            </TouchableOpacity>
          </View>

          {milestones.map((milestone, index) => (
            <View key={index} style={styles.milestoneItem}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.milestoneItemTitle}>
                    {milestone.title}
                  </Text>
                  {milestone.description && (
                    <Text style={styles.milestoneItemDescription}>
                      {milestone.description}
                    </Text>
                  )}
                </View>
                <TouchableOpacity onPress={() => removeMilestone(index)}>
                  <Text style={styles.removeButton}>×</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {milestones.length === 0 && (
            <Text style={styles.photoButtonText}>
              특별한 순간이 있다면 마일스톤을 추가해보세요
            </Text>
          )}
        </View>
      </View>

      {/* 저장 버튼 */}
      <View style={styles.submitButton}>
        <Button
          title="일기 저장"
          onPress={handleSubmit}
          variant="primary"
          loading={createDiaryMutation.isPending}
        />
      </View>

      {/* 날짜 피커 */}
      {showDatePicker && (
        <DateTimePicker
          value={new Date(currentDate)}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}
    </ScrollView>
  );
};
