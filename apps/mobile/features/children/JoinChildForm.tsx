import {
  JoinChildRequestSchema,
  type JoinChildRequest,
  GUARDIAN_ROLES,
} from "@daon/shared";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, Text, View } from "react-native";
import { useThemedStyles } from "../../shared/lib/hooks/useTheme";
import { Button, Input } from "../../shared/ui";

interface JoinChildFormProps {
  onSuccess: () => void;
}

export const JoinChildForm: React.FC<JoinChildFormProps> = ({ onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(JoinChildRequestSchema),
    defaultValues: {
      inviteCode: "",
      role: GUARDIAN_ROLES.GUARDIAN,
    },
  });

  const styles = useThemedStyles((theme) => ({
    container: {
      flex: 1,
      gap: theme.spacing.lg,
    },
    description: {
      fontSize: theme.typography.body2.fontSize,
      color: theme.colors.text.secondary,
      textAlign: "center" as const,
      marginBottom: theme.spacing.md,
    },
    inputContainer: {
      gap: theme.spacing.md,
    },
    buttonContainer: {
      marginTop: theme.spacing.xl,
    },
  }));

  const handleSubmit = form.handleSubmit(async (data: JoinChildRequest) => {
    setIsLoading(true);
    try {
      // TODO: API 호출 구현
      console.log("Join child with code:", data.inviteCode, "role:", data.role);

      // 임시 성공 처리
      Alert.alert("참여 완료", "아이의 관리자로 성공적으로 추가되었습니다.", [
        {
          text: "확인",
          onPress: onSuccess,
        },
      ]);
    } catch (error) {
      console.error("Join child error:", error);
      Alert.alert("오류", "아이 참여 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  });

  return (
    <View style={styles.container}>
      <Text style={styles.description}>
        이미 등록된 아이의 관리자로 참여하려면{"\n"}
        초대 코드를 입력해주세요
      </Text>

      <View style={styles.inputContainer}>
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

      <View style={styles.buttonContainer}>
        <Button
          title="참여하기"
          onPress={handleSubmit}
          variant="primary"
          loading={isLoading}
        />
      </View>
    </View>
  );
};
