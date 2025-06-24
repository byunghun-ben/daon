import { type CreateChildRequest } from "@daon/shared";
import React, { useState } from "react";
import { Alert, Platform, ScrollView, Text, View } from "react-native";
import { useChildrenQuery, useCreateChild } from "../../shared/api/children";
import { SCREEN_PADDING } from "../../shared/config/theme";
import { useThemedStyles } from "../../shared/lib/hooks/useTheme";
import Button from "../../shared/ui/Button";
import Card from "../../shared/ui/Card";
import Input from "../../shared/ui/Input";

interface CreateChildFormProps {
  onSuccess?: (childData: any) => void;
  onError?: (error: any) => void;
  loading?: boolean;
  title?: string;
  subtitle?: string;
}

export const CreateChildForm = ({
  onSuccess,
  onError,
  loading: externalLoading = false,
  title,
  subtitle,
}: CreateChildFormProps) => {
  // TanStack Query 훅 사용
  const { data: childrenData } = useChildrenQuery();
  const createChildMutation = useCreateChild();

  // 첫 번째 아이인지 확인
  const isFirstChild = childrenData?.children.length === 0;

  const [formData, setFormData] = useState<CreateChildRequest>({
    name: "",
    birthDate: "",
    gender: "male",
    role: "owner",
  });
  const [errors, setErrors] = useState<Partial<CreateChildRequest>>({});

  const isLoading = externalLoading || createChildMutation.isPending;

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
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.sm,
    },
    subtitle: {
      fontSize: theme.typography.subtitle.fontSize,
      color: theme.colors.text.secondary,
      textAlign: "center" as const,
    },
    genderContainer: {
      marginBottom: theme.spacing.md,
    },
    genderLabel: {
      fontSize: theme.typography.body2.fontSize,
      fontWeight: "500" as const,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.xs,
    },
    genderButtons: {
      flexDirection: "row" as const,
      justifyContent: "space-between" as const,
    },
    genderButton: {
      flex: 1,
      marginHorizontal: theme.spacing.xs,
    },
    buttonContainer: {
      marginTop: theme.spacing.xl,
    },
  }));

  const validateForm = (): boolean => {
    const newErrors: Partial<CreateChildRequest> = {};

    if (!formData.name.trim()) {
      newErrors.name = "아이 이름을 입력해주세요";
    } else if (formData.name.trim().length < 1) {
      newErrors.name = "이름을 입력해주세요";
    }

    if (!formData.birthDate.trim()) {
      newErrors.birthDate = "생년월일을 입력해주세요";
    } else {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(formData.birthDate)) {
        newErrors.birthDate = "YYYY-MM-DD 형식으로 입력해주세요";
      } else {
        const birthDate = new Date(formData.birthDate);
        const now = new Date();
        const maxFutureDate = new Date();
        maxFutureDate.setMonth(now.getMonth() + 12); // Allow up to 12 months in the future for pregnancy

        if (isNaN(birthDate.getTime())) {
          newErrors.birthDate = "올바른 날짜를 입력해주세요";
        } else if (birthDate > maxFutureDate) {
          newErrors.birthDate = "출산예정일이 너무 멀리 설정되었습니다";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = async () => {
    if (!validateForm()) return;

    const childData: CreateChildRequest = {
      ...formData,
      role: "owner",
    };

    createChildMutation.mutate(childData, {
      onSuccess: (response) => {
        if (onSuccess) {
          onSuccess(response);
        } else {
          Alert.alert("성공", "아이 프로필이 생성되었습니다!");
        }
      },
      onError: (error: any) => {
        if (onError) {
          onError(error);
        } else {
          Alert.alert(
            "오류",
            error.message || "아이 프로필 생성 중 오류가 발생했습니다.",
          );
        }
      },
    });
  };

  const defaultTitle = isFirstChild ? "아이 프로필 만들기" : "새 아이 프로필";
  const defaultSubtitle = isFirstChild
    ? "소중한 아이의 정보를 입력해주세요"
    : "새로운 아이의 프로필을 만들어주세요";

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{title || defaultTitle}</Text>
          <Text style={styles.subtitle}>{subtitle || defaultSubtitle}</Text>
        </View>

        <Card>
          <Input
            label="아이 이름"
            value={formData.name}
            onChangeText={(name) => setFormData({ ...formData, name })}
            error={errors.name}
            placeholder="예: 다온이"
          />

          <Input
            label="생년월일 (또는 출산예정일)"
            value={formData.birthDate}
            onChangeText={(birthDate) =>
              setFormData({ ...formData, birthDate })
            }
            error={errors.birthDate}
            placeholder="YYYY-MM-DD"
            keyboardType={
              Platform.OS === "ios" ? "numbers-and-punctuation" : "numeric"
            }
          />

          <View style={styles.genderContainer}>
            <Text style={styles.genderLabel}>성별 (선택사항)</Text>
            <View style={styles.genderButtons}>
              <Button
                title="남아"
                variant={formData.gender === "male" ? "primary" : "outline"}
                size="small"
                buttonStyle={styles.genderButton}
                onPress={() =>
                  setFormData({
                    ...formData,
                    gender: "male",
                  })
                }
                loading={isLoading}
              />
              <Button
                title="여아"
                variant={formData.gender === "female" ? "primary" : "outline"}
                size="small"
                buttonStyle={styles.genderButton}
                onPress={() =>
                  setFormData({
                    ...formData,
                    gender: "female",
                  })
                }
                loading={isLoading}
              />
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <Button
              title="프로필 생성"
              onPress={handleCreate}
              loading={isLoading}
            />
          </View>
        </Card>
      </ScrollView>
    </View>
  );
};
