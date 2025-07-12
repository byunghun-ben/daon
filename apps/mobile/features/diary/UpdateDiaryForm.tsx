import { useUpdateDiaryEntry } from "@/shared/api/diary/hooks/useUpdateDiaryEntry";
import { useActiveChild } from "@/shared/hooks/useActiveChild";
import Button from "@/shared/ui/Button/Button";
import { ImageUploader } from "@/shared/ui/ImageUploader";
import TextArea from "@/shared/ui/TextArea/TextArea";
import {
  UpdateDiaryEntryRequestSchema,
  type CreateMilestoneRequest,
  type DiaryEntryApi,
  type UpdateDiaryEntryRequest,
} from "@daon/shared";
import { zodResolver } from "@hookform/resolvers/zod";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface UpdateDiaryFormProps {
  diaryEntry: DiaryEntryApi;
  onSuccess: () => void;
}

export const UpdateDiaryForm: React.FC<UpdateDiaryFormProps> = ({
  diaryEntry,
  onSuccess,
}) => {
  const { availableChildren } = useActiveChild();
  const updateDiaryMutation = useUpdateDiaryEntry();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>(
    diaryEntry.photos || [],
  );

  const form = useForm({
    resolver: zodResolver(UpdateDiaryEntryRequestSchema),
    defaultValues: {
      date: diaryEntry.date,
      content: diaryEntry.content,
      photos: diaryEntry.photos || [],
      videos: diaryEntry.videos || [],
      milestones: diaryEntry.milestones || [],
    },
  });

  const {
    fields: milestoneFields,
    append: appendMilestone,
    remove: removeMilestone,
  } = useFieldArray({
    control: form.control,
    name: "milestones",
  });

  const currentDate = useWatch({ control: form.control, name: "date" });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const addMilestone = () => {
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
              const newMilestone: CreateMilestoneRequest = {
                type: "custom",
                description: title.trim(),
                achievedAt: new Date().toISOString(),
                childId: diaryEntry.childId,
                diaryEntryId: diaryEntry.id,
              };
              appendMilestone(newMilestone);
            }
          },
        },
      ],
      "plain-text",
    );
  };

  const handleSubmit = form.handleSubmit(
    async (data: UpdateDiaryEntryRequest) => {
      try {
        await updateDiaryMutation.mutateAsync({
          id: diaryEntry.id,
          data,
        });

        Alert.alert("완료", "일기가 성공적으로 수정되었습니다.", [
          { text: "확인", onPress: onSuccess },
        ]);
      } catch (error) {
        console.error("Update diary error:", error);
        Alert.alert("오류", "일기 수정 중 오류가 발생했습니다.");
      }
    },
  );

  return (
    <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
      {/* 아이 정보 (읽기 전용) */}
      <View className="mb-6">
        <Text className="text-lg font-semibold text-foreground mb-3">아이</Text>
        <View className="bg-surface border border-border rounded-lg p-4">
          <Text className="text-base text-foreground">
            {availableChildren.find((child) => child.id === diaryEntry.childId)
              ?.name || "알 수 없음"}
          </Text>
        </View>
      </View>

      {/* 날짜 선택 */}
      <View className="mb-6">
        <Text className="text-lg font-semibold text-foreground mb-3">날짜</Text>
        <TouchableOpacity
          className="bg-surface border border-border rounded-lg p-4"
          onPress={() => setShowDatePicker(true)}
        >
          <Text className="text-base text-foreground">
            📅 {formatDate(currentDate)}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 일기 내용 */}
      <View className="mb-6">
        <Controller
          control={form.control}
          name="content"
          rules={{ required: "일기 내용을 입력해주세요" }}
          render={({
            field: { onChange, onBlur, value },
            fieldState: { error },
          }) => (
            <TextArea
              label="일기 내용"
              placeholder="오늘 아이와 함께한 특별한 순간을 기록해보세요"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={error?.message}
              rows={8}
            />
          )}
        />
      </View>

      {/* 사진 수정 */}
      <View className="mb-6">
        <ImageUploader
          images={selectedImages}
          onImagesChange={(images) => {
            setSelectedImages(images);
            form.setValue("photos", images);
          }}
          maxImages={5}
          disabled={updateDiaryMutation.isPending}
        />
      </View>

      {/* 마일스톤 */}
      <View className="mb-6">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-lg font-semibold text-foreground">
            마일스톤
          </Text>
          <TouchableOpacity
            className="py-2 px-4 rounded-lg bg-primary"
            onPress={addMilestone}
          >
            <Text className="text-white text-sm font-semibold">+ 추가</Text>
          </TouchableOpacity>
        </View>

        <View className="bg-surface p-4 rounded-lg">
          {milestoneFields.map((field, index) => (
            <View
              key={field.id}
              className="p-3 bg-background rounded-lg mb-3 last:mb-0"
            >
              <View className="flex-row justify-between items-start">
                <View className="flex-1 mr-3">
                  <Text className="text-base font-semibold text-foreground mb-1">
                    🏆 {field.description}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => removeMilestone(index)}
                  className="p-1"
                >
                  <Text className="text-destructive text-xl font-bold">×</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {milestoneFields.length === 0 && (
            <Text className="text-sm text-muted-foreground text-center py-4">
              🌟 특별한 순간이 있다면 마일스톤을 추가해보세요
            </Text>
          )}
        </View>
      </View>

      {/* 저장 버튼 */}
      <View className="mt-6 mb-8">
        <Button
          title="일기 수정"
          onPress={handleSubmit}
          variant="primary"
          loading={updateDiaryMutation.isPending}
        />
      </View>

      {/* 날짜 피커 모달 */}
      <Modal
        visible={showDatePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View className="flex-1 justify-end">
          <View className="bg-background rounded-t-lg p-4">
            <View className="flex-row justify-between items-center mb-4">
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Text className="text-primary text-lg font-medium">취소</Text>
              </TouchableOpacity>
              <Text className="text-lg font-semibold text-foreground">
                날짜 선택
              </Text>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Text className="text-primary text-lg font-medium">완료</Text>
              </TouchableOpacity>
            </View>
            <Controller
              control={form.control}
              name="date"
              render={({ field: { onChange, value } }) => (
                <DateTimePicker
                  value={new Date(value || new Date())}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={(_event, selectedDate) => {
                    if (selectedDate) {
                      const dateString = selectedDate
                        .toISOString()
                        .split("T")[0];
                      onChange(dateString);
                    }
                  }}
                  style={{ backgroundColor: "transparent" }}
                  locale="ko-KR"
                />
              )}
            />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};
