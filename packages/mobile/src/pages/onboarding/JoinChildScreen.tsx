import React, { useState } from "react";
import { Alert, Text, View, TouchableOpacity } from "react-native";
import { childrenApi } from "../../shared/api/children";
import { useThemedStyles } from "../../shared/lib/hooks/useTheme";
import { Button, Card, Input } from "../../shared/ui";
import type { OnboardingJoinChildScreenProps } from "../../shared/types/navigation";
import { useOnboardingStore } from "../../shared/store";

type Role = "guardian" | "viewer";

export const JoinChildScreen = ({
  navigation,
  route,
}: OnboardingJoinChildScreenProps) => {
  const [inviteCode, setInviteCode] = useState("");
  const [selectedRole, setSelectedRole] = useState<Role>("guardian");
  const [isLoading, setIsLoading] = useState(false);
  const completeOnboarding = useOnboardingStore((state) => state.complete);

  const handleJoinChild = async () => {
    if (!inviteCode.trim()) {
      Alert.alert("알림", "초대 코드를 입력해주세요.");
      return;
    }

    setIsLoading(true);
    try {
      const joinData = {
        inviteCode: inviteCode.trim(),
        role: selectedRole,
      };
      const response = await childrenApi.joinChild(joinData);

      Alert.alert(
        "성공",
        `${response.child.name}의 ${
          selectedRole === "guardian" ? "보호자" : "관람자"
        }로 등록되었습니다!`,
        [
          {
            text: "확인",
            onPress: () => {
              completeOnboarding();
            },
          },
        ],
      );
    } catch (error: any) {
      console.error("초대 코드 처리 오류:", error);
      Alert.alert(
        "오류",
        error.message || "초대 코드가 올바르지 않습니다. 다시 확인해주세요.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const styles = useThemedStyles((theme) => ({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      padding: theme.spacing.lg,
    },
    content: {
      flex: 1,
      justifyContent: "center" as const,
    },
    header: {
      alignItems: "center" as const,
      marginBottom: theme.spacing.xl,
    },
    icon: {
      fontSize: 72,
      marginBottom: theme.spacing.lg,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold" as const,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.md,
      textAlign: "center" as const,
    },
    description: {
      fontSize: 16,
      color: theme.colors.text.secondary,
      textAlign: "center" as const,
      lineHeight: 24,
      marginBottom: theme.spacing.xl,
    },
    form: {
      marginBottom: theme.spacing.xl,
    },
    inputLabel: {
      fontSize: 16,
      fontWeight: "600" as const,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.sm,
    },
    inputHelper: {
      fontSize: 14,
      color: theme.colors.text.secondary,
      marginTop: theme.spacing.sm,
      lineHeight: 20,
    },
    buttonContainer: {
      gap: theme.spacing.md,
    },
    roleContainer: {
      marginBottom: theme.spacing.lg,
    },
    roleLabel: {
      fontSize: 16,
      fontWeight: "600" as const,
      color: theme.colors.text.primary,
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
      backgroundColor: theme.colors.primary + "10",
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
      color: theme.colors.text.primary,
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
      color: theme.colors.text.secondary,
    },
  }));

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.icon}>👶</Text>
          <Text style={styles.title}>기존 아이 참여하기</Text>
          <Text style={styles.description}>
            다른 보호자로부터 받은{"\n"}
            초대 코드를 입력해주세요.{"\n\n"}
            아이의 육아 기록을 함께 관리할 수 있어요.
          </Text>
        </View>

        <Card style={styles.form}>
          <Text style={styles.inputLabel}>초대 코드</Text>
          <Input
            value={inviteCode}
            onChangeText={setInviteCode}
            placeholder="초대 코드를 입력하세요"
            autoCapitalize="characters"
            autoCorrect={false}
            returnKeyType="done"
            onSubmitEditing={handleJoinChild}
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
          <Button
            title="참여하기"
            onPress={handleJoinChild}
            loading={isLoading}
            disabled={!inviteCode.trim()}
          />
          <Button
            title="이전으로"
            variant="secondary"
            onPress={handleBack}
            disabled={isLoading}
          />
        </View>
      </View>
    </View>
  );
};
