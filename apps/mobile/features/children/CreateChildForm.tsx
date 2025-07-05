import {
  CreateChildRequestSchema,
  GENDERS,
  type CreateChildRequest,
} from "@daon/shared";
import { zodResolver } from "@hookform/resolvers/zod";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, Text, View } from "react-native";
import { useCreateChild } from "../../shared/api/children";
import { Button, Input } from "../../shared/ui";

interface CreateChildFormProps {
  onSuccess: () => void;
}

export const CreateChildForm: React.FC<CreateChildFormProps> = ({
  onSuccess,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const createChildMutation = useCreateChild();

  const form = useForm({
    resolver: zodResolver(CreateChildRequestSchema),
    defaultValues: {
      name: "",
      birthDate: "",
      gender: null,
      photoUrl: null,
      birthWeight: null,
      birthHeight: null,
    },
  });

  const handleSelectPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "권한 필요",
        "사진을 선택하려면 갤러리 접근 권한이 필요합니다.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
      // TODO: Upload image and get URL
      // form.setValue("photoUrl", result.assets[0].uri);
    }
  };

  const handleSubmit = async (data: CreateChildRequest) => {
    try {
      console.log("Creating child with data:", data);

      await createChildMutation.mutateAsync(data);

      Alert.alert("성공", "아이 프로필이 생성되었습니다!", [
        { text: "확인", onPress: onSuccess },
      ]);
    } catch (error) {
      console.error("Error creating child:", error);
      Alert.alert(
        "오류",
        "아이 프로필 생성 중 문제가 발생했습니다. 다시 시도해주세요.",
      );
    }
  };

  const formatDateInput = (value: string) => {
    // YYYY-MM-DD 형식으로 자동 포맷팅
    const numbers = value.replace(/[^\d]/g, "");
    if (numbers.length <= 4) {
      return numbers;
    } else if (numbers.length <= 6) {
      return `${numbers.slice(0, 4)}-${numbers.slice(4)}`;
    } else {
      return `${numbers.slice(0, 4)}-${numbers.slice(4, 6)}-${numbers.slice(6, 8)}`;
    }
  };

  return (
    <View className="flex-1 gap-4">
      {/* 기본 정보 */}
      <View className="gap-4">
        <Text className="text-lg font-bold text-gray-500">기본 정보</Text>

        <View className="gap-2">
          <Controller
            control={form.control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="이름 *"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={form.formState.errors.name?.message}
                placeholder="아이의 이름을 입력해주세요"
                autoCapitalize="words"
                returnKeyType="next"
              />
            )}
          />

          <Controller
            control={form.control}
            name="birthDate"
            render={({ field: { onChange, onBlur, value } }) => (
              <View
                style={{
                  flexDirection: "column",
                  gap: "1px",
                }}
              >
                <Input
                  label="생년월일 *"
                  value={formatDateInput(value)}
                  onChangeText={(text) => onChange(formatDateInput(text))}
                  onBlur={onBlur}
                  error={form.formState.errors.birthDate?.message}
                  placeholder="YYYY-MM-DD"
                  keyboardType="numeric"
                  maxLength={10}
                  returnKeyType="next"
                />
                <Text className="text-sm text-gray-500">
                  예: 2024-01-15 (YYYY-MM-DD 형식)
                </Text>
              </View>
            )}
          />
        </View>

        <View className="gap-2">
          <Text className="text-lg font-bold text-gray-500">성별</Text>
          <Controller
            control={form.control}
            name="gender"
            render={({ field: { onChange, value } }) => (
              <View className="flex flex-row gap-2">
                <Button
                  title="남아"
                  variant={value === GENDERS.MALE ? "primary" : "outline"}
                  onPress={() => onChange(GENDERS.MALE)}
                  className="flex-1"
                />
                <Button
                  title="여아"
                  variant={value === GENDERS.FEMALE ? "primary" : "outline"}
                  onPress={() => onChange(GENDERS.FEMALE)}
                  className="flex-1"
                />
                <Button
                  title="선택 안함"
                  variant={value === null ? "primary" : "outline"}
                  onPress={() => onChange(null)}
                  className="flex-1"
                />
              </View>
            )}
          />
        </View>
      </View>

      {/* 사진 */}
      <View className="gap-2">
        <Text className="text-lg font-bold text-gray-500">프로필 사진</Text>
        <Button
          title={selectedImage ? "사진 변경" : "사진 선택"}
          variant="outline"
          onPress={handleSelectPhoto}
        />
        <Text className="text-sm text-gray-500">
          선택사항입니다. 나중에 언제든지 추가하거나 변경할 수 있어요.
        </Text>
      </View>

      {/* 출생 정보 */}
      <View className="gap-2">
        <Text className="text-lg font-bold text-gray-500">
          출생 정보 (선택사항)
        </Text>

        <View className="flex flex-row gap-2">
          <Controller
            control={form.control}
            name="birthWeight"
            render={({ field: { onChange, onBlur, value } }) => (
              <View className="flex-1">
                <Input
                  label="출생 시 몸무게 (kg)"
                  value={value?.toString() || ""}
                  onChangeText={(text) => {
                    const numValue = parseFloat(text);
                    onChange(isNaN(numValue) ? null : numValue);
                  }}
                  onBlur={onBlur}
                  error={form.formState.errors.birthWeight?.message}
                  placeholder="3.2"
                  keyboardType="decimal-pad"
                  returnKeyType="next"
                />
              </View>
            )}
          />

          <Controller
            control={form.control}
            name="birthHeight"
            render={({ field: { onChange, onBlur, value } }) => (
              <View className="flex-1">
                <Input
                  label="출생 시 키 (cm)"
                  value={value?.toString() || ""}
                  onChangeText={(text) => {
                    const numValue = parseFloat(text);
                    onChange(isNaN(numValue) ? null : numValue);
                  }}
                  onBlur={onBlur}
                  error={form.formState.errors.birthHeight?.message}
                  placeholder="50.5"
                  keyboardType="decimal-pad"
                  returnKeyType="done"
                />
              </View>
            )}
          />
        </View>

        <Text className="text-sm text-gray-500">
          출생 정보는 성장 그래프와 통계에 활용되며, 나중에 입력하거나 수정할 수
          있어요.
        </Text>
      </View>

      {/* 제출 버튼 */}
      <Button
        title={
          createChildMutation.isPending ? "생성 중..." : "아이 프로필 만들기"
        }
        onPress={form.handleSubmit(handleSubmit)}
        disabled={createChildMutation.isPending}
        variant="primary"
        className="mt-4"
      />
    </View>
  );
};
