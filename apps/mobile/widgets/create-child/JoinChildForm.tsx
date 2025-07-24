import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useJoinChild } from "../../shared/api/children/hooks/useJoinChild";
import { SCREEN_PADDING } from "../../shared/config/theme";
import { useThemedStyles } from "../../shared/lib/hooks/useTheme";
import {
  type JoinChildFormData,
  JoinChildFormSchema,
} from "../../shared/types/forms";
import { ButtonV2, ButtonText } from "../../shared/ui/Button/ButtonV2";
import Card from "../../shared/ui/Card/Card";
import Input from "../../shared/ui/Input/Input";

type Role = "guardian" | "viewer";

interface JoinChildFormProps {
  onSuccess?: (childData: unknown) => void;
  onError?: (error: unknown) => void;
  loading?: boolean;
  title?: string;
  subtitle?: string;
}

export const JoinChildForm = ({
  onSuccess,
  onError,
  loading: externalLoading = false,
  title = "기존 아이 참여하기",
  subtitle = "다른 보호자로부터 받은 초대 코드를 입력해주세요",
}: JoinChildFormProps) => {
  const [selectedRole, setSelectedRole] = useState<Role>("guardian");
  const joinChildMutation = useJoinChild();

  // React Hook Form
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<JoinChildFormData>({
    resolver: zodResolver(JoinChildFormSchema),
    defaultValues: {
      inviteCode: "",
    },
  });

  const isLoading = externalLoading || joinChildMutation.isPending;

  const styles = useThemedStyles((theme) => ({
    container: {
      flex: 1,
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
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
    },
    subtitle: {
      fontSize: theme.typography.subtitle.fontSize,
      color: theme.colors.textSecondary,
      textAlign: "center" as const,
    },
    form: {
      marginBottom: theme.spacing.xl,
    },
    inputLabel: {
      fontSize: 16,
      fontWeight: "600" as const,
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
    },
    inputHelper: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.sm,
      lineHeight: 20,
    },
    roleContainer: {
      marginBottom: theme.spacing.lg,
    },
    roleLabel: {
      fontSize: 16,
      fontWeight: "600" as const,
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
    },
    roleOptions: {
      flexDirection: "row" as const,
      gap: theme.spacing.sm,
    },
    roleOption: {
      flex: 1,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      borderWidth: 2,
      alignItems: "center" as const,
    },
    roleOptionSelected: {
      borderColor: theme.colors.primary,
      backgroundColor: `${theme.colors.primary}10`,
    },
    roleOptionUnselected: {
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    roleOptionTitle: {
      fontSize: 14,
      fontWeight: "600" as const,
      marginBottom: theme.spacing.xs,
    },
    roleOptionTitleSelected: {
      color: theme.colors.primary,
    },
    roleOptionTitleUnselected: {
      color: theme.colors.text,
    },
    roleOptionDescription: {
      fontSize: 12,
      textAlign: "center" as const,
      lineHeight: 16,
    },
    roleOptionDescriptionSelected: {
      color: theme.colors.primary,
    },
    roleOptionDescriptionUnselected: {
      color: theme.colors.textSecondary,
    },
    buttonContainer: {
      marginTop: theme.spacing.xl,
    },
  }));

  const onSubmit = async (data: JoinChildFormData) => {
    const joinData = {
      inviteCode: data.inviteCode.trim(),
      role: selectedRole,
    };

    joinChildMutation.mutate(joinData, {
      onSuccess: (response) => {
        if (onSuccess) {
          onSuccess(response);
        } else {
          Alert.alert(
            "성공",
            `${response.child.name}의 ${
              selectedRole === "guardian" ? "보호자" : "관람자"
            }로 등록되었습니다!`,
          );
        }
      },
      onError: (error) => {
        if (onError) {
          onError(error);
        } else {
          Alert.alert(
            "오류",
            error.message ||
              "초대 코드가 올바르지 않습니다. 다시 확인해주세요.",
          );
        }
      },
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>

        <Card style={styles.form}>
          <Text style={styles.inputLabel}>초대 코드</Text>
          <Controller
            control={control}
            name="inviteCode"
            render={({ field: { value, onChange } }) => (
              <Input
                value={value}
                onChangeText={onChange}
                error={errors.inviteCode?.message}
                placeholder="초대 코드를 입력하세요"
                autoCapitalize="characters"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={handleSubmit(onSubmit)}
              />
            )}
          />
          <Text style={styles.inputHelper}>
            초대 코드는 대소문자를 구분하지 않습니다.{"\n"}
            공백은 자동으로 제거됩니다.
          </Text>
        </Card>

        <View style={styles.roleContainer}>
          <Text style={styles.roleLabel}>참여 역할 선택</Text>
          <View style={styles.roleOptions}>
            <TouchableOpacity
              style={[
                styles.roleOption,
                selectedRole === "guardian"
                  ? styles.roleOptionSelected
                  : styles.roleOptionUnselected,
              ]}
              onPress={() => setSelectedRole("guardian")}
              disabled={isLoading}
            >
              <Text
                style={[
                  styles.roleOptionTitle,
                  selectedRole === "guardian"
                    ? styles.roleOptionTitleSelected
                    : styles.roleOptionTitleUnselected,
                ]}
              >
                보호자
              </Text>
              <Text
                style={[
                  styles.roleOptionDescription,
                  selectedRole === "guardian"
                    ? styles.roleOptionDescriptionSelected
                    : styles.roleOptionDescriptionUnselected,
                ]}
              >
                활동 기록 작성,{"\n"}수정, 삭제 가능
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.roleOption,
                selectedRole === "viewer"
                  ? styles.roleOptionSelected
                  : styles.roleOptionUnselected,
              ]}
              onPress={() => setSelectedRole("viewer")}
              disabled={isLoading}
            >
              <Text
                style={[
                  styles.roleOptionTitle,
                  selectedRole === "viewer"
                    ? styles.roleOptionTitleSelected
                    : styles.roleOptionTitleUnselected,
                ]}
              >
                관람자
              </Text>
              <Text
                style={[
                  styles.roleOptionDescription,
                  selectedRole === "viewer"
                    ? styles.roleOptionDescriptionSelected
                    : styles.roleOptionDescriptionUnselected,
                ]}
              >
                기록 조회만{"\n"}가능
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <ButtonV2 onPress={handleSubmit(onSubmit)} disabled={isLoading}>
            <ButtonText>참여하기</ButtonText>
          </ButtonV2>
        </View>
      </ScrollView>
    </View>
  );
};
