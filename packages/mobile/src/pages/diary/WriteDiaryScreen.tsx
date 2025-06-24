import {
  CreateDiaryEntryRequest,
  type ChildApi as Child,
  type DiaryEntryApi as DiaryEntry,
} from "@daon/shared";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { childrenApi } from "../../shared/api/children";
import { diaryApi } from "../../shared/api/diary";
import { SCREEN_PADDING } from "../../shared/config/theme";
import { useThemedStyles } from "../../shared/lib/hooks/useTheme";
import { DiaryFormData, DiaryFormSchema } from "../../shared/types/forms";
import { WriteDiaryScreenProps } from "../../shared/types/navigation";
import Button from "../../shared/ui/Button";
import Card from "../../shared/ui/Card";
import Input from "../../shared/ui/Input";

export default function WriteDiaryScreen({
  navigation,
  route,
}: WriteDiaryScreenProps) {
  const {
    childId: initialChildId,
    diaryId,
    isEditing = false,
  } = route?.params || {};

  const [children, setChildren] = useState<Child[]>([]);
  const [, setDiary] = useState<DiaryEntry | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // React Hook Form
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<DiaryFormData>({
    resolver: zodResolver(DiaryFormSchema),
    defaultValues: {
      childId: initialChildId || "",
      date: new Date().toISOString().split("T")[0],
      content: "",
      photos: [],
      videos: [],
      milestones: [],
    },
  });

  const watchedChildId = watch("childId");
  const watchedPhotos = watch("photos");
  const watchedVideos = watch("videos");

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
    contentInput: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      fontSize: theme.typography.body1.fontSize,
      color: theme.colors.text.primary,
      backgroundColor: theme.colors.surface,
      minHeight: 200,
      textAlignVertical: "top" as const,
    },
    contentInputError: {
      borderColor: theme.colors.error,
    },
    mediaContainer: {
      marginTop: theme.spacing.md,
    },
    mediaButton: {
      marginBottom: theme.spacing.sm,
    },
    mediaList: {
      marginTop: theme.spacing.sm,
    },
    mediaItem: {
      flexDirection: "row" as const,
      justifyContent: "space-between" as const,
      alignItems: "center" as const,
      padding: theme.spacing.sm,
      backgroundColor: theme.colors.background,
      borderRadius: theme.borderRadius.sm,
      marginBottom: theme.spacing.xs,
    },
    mediaText: {
      fontSize: theme.typography.body2.fontSize,
      color: theme.colors.text.secondary,
      flex: 1,
    },
    removeButton: {
      padding: theme.spacing.xs,
    },
    removeButtonText: {
      color: theme.colors.error,
      fontSize: theme.typography.body2.fontSize,
    },
    error: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.error,
      marginTop: theme.spacing.xs,
    },
  }));

  useEffect(() => {
    loadChildren();
  }, []);

  useEffect(() => {
    if (diaryId && isEditing) {
      loadDiary();
    }
  }, [diaryId, isEditing]);

  const loadChildren = async () => {
    try {
      const response = await childrenApi.getChildren();
      setChildren(response.children);

      // If no child is selected and there's only one child, select it automatically
      if (!watchedChildId && response.children.length === 1) {
        const childId = response.children[0].id;
        setValue("childId", childId);
      }
    } catch (error: any) {
      Alert.alert("오류", "아이 목록을 불러오는데 실패했습니다.");
    }
  };

  const loadDiary = async () => {
    if (!diaryId) return;

    setIsLoading(true);
    try {
      const response = await diaryApi.getDiaryEntry(diaryId);
      setDiary(response.diaryEntry);
      reset({
        childId: response.diaryEntry.childId,
        date: response.diaryEntry.date,
        content: response.diaryEntry.content,
        photos: response.diaryEntry.photos || [],
        videos: response.diaryEntry.videos || [],
        milestones: response.diaryEntry.milestones.map((milestone) => ({
          ...milestone,
          childId: response.diaryEntry.childId,
        })),
      });
    } catch (error: any) {
      Alert.alert("오류", "일기를 불러오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: DiaryFormData) => {
    setIsLoading(true);
    try {
      const diaryData: CreateDiaryEntryRequest = {
        childId: data.childId,
        date: data.date,
        content: data.content,
        photos: data.photos || [],
        videos: data.videos || [],
        milestones: data.milestones || [],
      };

      if (isEditing && diaryId) {
        await diaryApi.updateDiaryEntry(diaryId, diaryData);
        Alert.alert("성공", "일기가 수정되었습니다!", [
          { text: "확인", onPress: () => navigation.goBack() },
        ]);
      } else {
        await diaryApi.createDiaryEntry(diaryData);
        Alert.alert("성공", "일기가 저장되었습니다!", [
          { text: "확인", onPress: () => navigation.goBack() },
        ]);
      }
    } catch (error: any) {
      Alert.alert("오류", error.message || "일기 저장 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPhoto = () => {
    // TODO: Implement image picker
    Alert.alert("기능 준비 중", "사진 추가 기능은 곧 업데이트됩니다.");
  };

  const handleAddVideo = () => {
    // TODO: Implement video picker
    Alert.alert("기능 준비 중", "동영상 추가 기능은 곧 업데이트됩니다.");
  };

  const removeMedia = (type: "photos" | "videos", index: number) => {
    if (type === "photos") {
      setValue("photos", watchedPhotos?.filter((_, i) => i !== index) || []);
    } else {
      setValue("videos", watchedVideos?.filter((_, i) => i !== index) || []);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {isEditing ? "일기 수정" : "일기 쓰기"}
          </Text>
          <Text style={styles.subtitle}>
            {isEditing
              ? "소중한 추억을 수정해보세요"
              : "오늘의 소중한 순간을 기록해보세요"}
          </Text>
        </View>

        {/* Child Selection */}
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
            <Text style={styles.error}>{errors.childId.message}</Text>
          )}
        </Card>

        {/* Date Selection */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>날짜</Text>
          <Controller
            control={control}
            name="date"
            render={({ field: { value, onChange } }) => (
              <Input
                value={value}
                onChangeText={onChange}
                error={errors.date?.message}
                placeholder="YYYY-MM-DD"
              />
            )}
          />
        </Card>

        {/* Content */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>일기 내용</Text>
          <Controller
            control={control}
            name="content"
            render={({ field: { value, onChange } }) => (
              <>
                <TextInput
                  style={[
                    styles.contentInput,
                    errors.content && styles.contentInputError,
                  ]}
                  value={value}
                  onChangeText={onChange}
                  placeholder="오늘은 어떤 특별한 일이 있었나요? 아이의 귀여운 모습이나 새로운 변화를 자유롭게 적어보세요."
                  multiline
                  numberOfLines={10}
                  textAlignVertical="top"
                />
                {errors.content && (
                  <Text style={styles.error}>{errors.content.message}</Text>
                )}
              </>
            )}
          />
        </Card>

        {/* Media */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>사진 및 동영상</Text>
          <View style={styles.mediaContainer}>
            <Button
              title="사진 추가"
              variant="outline"
              size="small"
              buttonStyle={styles.mediaButton}
              onPress={handleAddPhoto}
            />
            <Button
              title="동영상 추가"
              variant="outline"
              size="small"
              buttonStyle={styles.mediaButton}
              onPress={handleAddVideo}
            />

            {/* Photos List */}
            {watchedPhotos && watchedPhotos.length > 0 && (
              <View style={styles.mediaList}>
                <Text style={styles.sectionTitle}>
                  사진 ({watchedPhotos.length})
                </Text>
                {watchedPhotos.map((_, index) => (
                  <View key={index} style={styles.mediaItem}>
                    <Text style={styles.mediaText} numberOfLines={1}>
                      📷 사진 {index + 1}
                    </Text>
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => removeMedia("photos", index)}
                    >
                      <Text style={styles.removeButtonText}>삭제</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {/* Videos List */}
            {watchedVideos && watchedVideos.length > 0 && (
              <View style={styles.mediaList}>
                <Text style={styles.sectionTitle}>
                  동영상 ({watchedVideos.length})
                </Text>
                {watchedVideos.map((_, index) => (
                  <View key={index} style={styles.mediaItem}>
                    <Text style={styles.mediaText} numberOfLines={1}>
                      🎥 동영상 {index + 1}
                    </Text>
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => removeMedia("videos", index)}
                    >
                      <Text style={styles.removeButtonText}>삭제</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        </Card>

        {/* Save Button */}
        <Button
          title={
            isLoading ? "저장 중..." : isEditing ? "일기 수정" : "일기 저장"
          }
          onPress={handleSubmit(onSubmit)}
          disabled={isLoading}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
