import { useJoinChild } from "@/shared/api/children/hooks/useJoinChild";
import { ApiError } from "@/shared/api/client";
import Button from "@/shared/ui/Button/Button";
import Input from "@/shared/ui/Input/Input";
import { GUARDIAN_ROLES, JoinChildRequestSchema } from "@daon/shared";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, Text, View } from "react-native";

interface JoinChildFormProps {
  onSuccess: () => void;
}

export const JoinChildForm: React.FC<JoinChildFormProps> = ({ onSuccess }) => {
  const joinChild = useJoinChild();

  const form = useForm({
    resolver: zodResolver(JoinChildRequestSchema),
    defaultValues: {
      inviteCode: "",
      role: GUARDIAN_ROLES.GUARDIAN,
    },
  });

  const handleSubmit = form.handleSubmit((data) => {
    joinChild.mutate(data, {
      onSuccess: (response) => {
        console.log("Successfully joined child:", response.child);
        Alert.alert(
          "참여 완료",
          `${response.child.name}의 관리자로 성공적으로 추가되었습니다.`,
          [
            {
              text: "확인",
              onPress: onSuccess,
            },
          ],
        );
      },
      onError: (error) => {
        console.error("Join child error:", error);

        // 에러 메시지 한글 매핑
        let errorMessage = "아이 참여 중 오류가 발생했습니다.";

        if (error instanceof ApiError) {
          const message = error.message.toLowerCase();
          console.log("message", message);

          if (message.includes("invalid invite code")) {
            errorMessage = "유효하지 않은 초대 코드입니다.";
          } else if (message.includes("already connected to this child")) {
            errorMessage = "이미 이 아이의 관리자로 등록되어 있습니다.";
          } else if (error.status === 404) {
            errorMessage = "유효하지 않은 초대 코드입니다.";
          } else if (error.status === 400) {
            errorMessage = "이미 이 아이의 관리자로 등록되어 있습니다.";
          } else if (error.status === 0) {
            errorMessage = "네트워크 오류가 발생했습니다. 다시 시도해주세요.";
          }
        }

        Alert.alert("오류", errorMessage);
      },
    });
  });

  return (
    <View className="flex-1 gap-4">
      <Text className="text-base text-gray-500 text-center">
        이미 등록된 아이의 관리자로 참여하려면{"\n"}
        초대 코드를 입력해주세요
      </Text>

      <View className="gap-2">
        <Controller
          control={form.control}
          name="inviteCode"
          render={({
            field: { onChange, onBlur, value },
            fieldState: { error },
          }) => (
            <Input
              label="초대 코드"
              placeholder="예: ABC123"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={error?.message}
              autoCapitalize="characters"
              maxLength={20}
            />
          )}
        />
      </View>

      <View className="mt-6">
        <Button
          title="참여하기"
          onPress={handleSubmit}
          variant="primary"
          loading={joinChild.isPending}
          disabled={!form.formState.isValid || joinChild.isPending}
        />
      </View>
    </View>
  );
};
