import { useCreateDiaryEntry } from "@/shared/api/diary/hooks/useCreateDiaryEntry";
import { useActiveChild } from "@/shared/hooks/useActiveChild";
import Button from "@/shared/ui/Button/Button";
import { ImageUploader } from "@/shared/ui/ImageUploader";
import TextArea from "@/shared/ui/TextArea/TextArea";
import ChildSelector from "@/widgets/ChildSelector/ChildSelector";
import {
  CreateDiaryEntryRequestSchema,
  type CreateDiaryEntryRequest,
  type CreateMilestoneRequest,
} from "@daon/shared";
import { zodResolver } from "@hookform/resolvers/zod";
import type { DateTimePickerEvent } from "@react-native-community/datetimepicker";
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

interface CreateDiaryFormProps {
  onSuccess: () => void;
}

export const CreateDiaryForm: React.FC<CreateDiaryFormProps> = ({
  onSuccess,
}) => {
  const { activeChild, availableChildren, setActiveChild } = useActiveChild();
  const createDiaryMutation = useCreateDiaryEntry();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

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

  const {
    fields: milestoneFields,
    append: appendMilestone,
    remove: removeMilestone,
  } = useFieldArray({
    control: form.control,
    name: "milestones",
  });

  const handleDateChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
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
    const selectedChildId = useWatch({
      control: form.control,
      name: "childId",
    });

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
                childId: selectedChildId || "",
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
    async (data: CreateDiaryEntryRequest) => {
      if (!data.childId) {
        Alert.alert("오류", "아이를 선택해주세요.");
        return;
      }

      try {
        await createDiaryMutation.mutateAsync(data);

        // 일기 작성한 아이를 activeChild로 설정
        const selectedChild = availableChildren.find(
          (child) => child.id === data.childId,
        );
        if (selectedChild) {
          setActiveChild(selectedChild.id);
        }

        Alert.alert("완료", "일기가 성공적으로 저장되었습니다.", [
          { text: "확인", onPress: onSuccess },
        ]);
      } catch (error) {
        console.error("Create diary error:", error);
        Alert.alert("오류", "일기 저장 중 오류가 발생했습니다.");
      }
    },
  );

  const currentDate = useWatch({ control: form.control, name: "date" });
  const currentChildId = useWatch({ control: form.control, name: "childId" });

  return (
    <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
      {/* 아이 선택 */}
      <View className="mb-6">
        <Controller
          control={form.control}
          name="childId"
          rules={{ required: "아이를 선택해주세요" }}
          render={({ field: { onChange, value } }) => (
            <ChildSelector
              childId={value}
              availableChildren={availableChildren}
              onChildSelect={onChange}
            />
          )}
        />
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

      {/* 사진 추가 */}
      <View className="mb-6">
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
      <View className="mb-6">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-lg font-semibold text-foreground">
            마일스톤
          </Text>
          <TouchableOpacity
            className="py-2 px-4 rounded-lg bg-primary"
            onPress={addMilestone}
            disabled={!currentChildId}
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
          title="일기 저장"
          onPress={handleSubmit}
          variant="primary"
          loading={createDiaryMutation.isPending}
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
            <DateTimePicker
              value={new Date(currentDate)}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={handleDateChange}
              style={{ backgroundColor: "transparent" }}
              locale="ko-KR"
            />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};
