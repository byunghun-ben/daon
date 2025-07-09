import { authApi } from "@/shared/api/auth";
import { useAuthStore } from "@/shared/store/authStore";
import Button from "@/shared/ui/Button/Button";
import Input from "@/shared/ui/Input/Input";
import { UpdateUserProfileRequestSchema } from "@daon/shared";
import { zodResolver } from "@hookform/resolvers/zod";
import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from "react-native";
import type { z } from "zod/v4";

type UpdateProfileFormData = z.infer<typeof UpdateUserProfileRequestSchema>;

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<UpdateProfileFormData>({
    resolver: zodResolver(UpdateUserProfileRequestSchema),
    defaultValues: {
      name: user?.name || "",
      phone: user?.phone || "",
    },
  });

  const handleSubmit = async (data: UpdateProfileFormData) => {
    try {
      setIsLoading(true);

      // 빈 문자열을 undefined로 변환
      const updateData = {
        ...data,
        name: data.name?.trim() || undefined,
        phone: data.phone?.trim() || undefined,
      };

      const response = await authApi.updateProfile(updateData);

      // 스토어 업데이트
      setUser(response.user);

      Alert.alert("성공", "프로필이 성공적으로 업데이트되었습니다.", [
        {
          text: "확인",
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error("Failed to update profile:", error);
      Alert.alert("오류", "프로필 업데이트에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: "프로필 편집",
          headerBackTitle: "설정",
          headerShown: true,
        }} 
      />
      <SafeAreaView className="flex-1 bg-background">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View className="p-6">

            {/* 이메일 (읽기 전용) */}
            <View className="mb-6">
              <Text className="text-base font-medium mb-2 text-text">
                이메일
              </Text>
              <View className="bg-gray-100 p-3 rounded-lg">
                <Text className="text-gray-600">{user?.email}</Text>
              </View>
              <Text className="text-sm text-gray-500 mt-1">
                이메일은 변경할 수 없습니다.
              </Text>
            </View>

            {/* 이름 */}
            <View className="mb-6">
              <Controller
                control={form.control}
                name="name"
                render={({ field: { onChange, value } }) => (
                  <Input
                    label="이름"
                    value={value || ""}
                    onChangeText={onChange}
                    placeholder="이름을 입력하세요"
                    error={form.formState.errors.name?.message}
                  />
                )}
              />
            </View>

            {/* 전화번호 */}
            <View className="mb-8">
              <Controller
                control={form.control}
                name="phone"
                render={({ field: { onChange, value } }) => (
                  <Input
                    label="전화번호"
                    value={value || ""}
                    onChangeText={onChange}
                    placeholder="전화번호를 입력하세요 (선택사항)"
                    keyboardType="phone-pad"
                    error={form.formState.errors.phone?.message}
                  />
                )}
              />
            </View>

            {/* 가입 정보 */}
            <View className="mb-8 p-4 bg-gray-50 rounded-lg">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                가입 정보
              </Text>
              <View className="space-y-1">
                <Text className="text-sm text-gray-600">
                  가입일:{" "}
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString("ko-KR")
                    : "정보 없음"}
                </Text>
                <Text className="text-sm text-gray-600">
                  최근 업데이트:{" "}
                  {user?.updatedAt
                    ? new Date(user.updatedAt).toLocaleDateString("ko-KR")
                    : "정보 없음"}
                </Text>
              </View>
            </View>

            {/* 버튼 */}
            <View className="flex-row gap-3">
              <Button
                title="취소"
                variant="outline"
                onPress={handleCancel}
                className="flex-1"
                disabled={isLoading}
              />
              <Button
                title={isLoading ? "저장 중..." : "저장"}
                variant="primary"
                onPress={form.handleSubmit(handleSubmit)}
                disabled={isLoading}
                className="flex-1"
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
    </>
  );
}
