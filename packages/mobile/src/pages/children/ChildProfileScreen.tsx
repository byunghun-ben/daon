import { type ChildApi as Child, type CreateChildRequest } from "@daon/shared";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  View,
  TouchableOpacity,
} from "react-native";
import { childrenApi } from "../../shared/api/children";
import { SCREEN_PADDING } from "../../shared/config/theme";
import { useThemedStyles } from "../../shared/lib/hooks/useTheme";
import Button from "../../shared/ui/Button";
import Card from "../../shared/ui/Card";
import Input from "../../shared/ui/Input";
import { ChildProfileScreenProps } from "../../shared/types/navigation";

export default function ChildProfileScreen({
  navigation,
  route,
}: ChildProfileScreenProps) {
  const {
    childId,
    isEditing = false,
    isFirstChild = false,
  } = route?.params || {};
  const [formData, setFormData] = useState<CreateChildRequest>({
    name: "",
    birthDate: "",
    gender: "male",
    role: "owner",
  });
  const [errors, setErrors] = useState<Partial<CreateChildRequest>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [, setChild] = useState<Child | null>(null);
  const [showInviteOption, setShowInviteOption] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [selectedRole, setSelectedRole] = useState<"guardian" | "viewer">(
    "guardian",
  );

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
    deleteButton: {
      marginTop: theme.spacing.md,
    },
    inviteSection: {
      marginBottom: theme.spacing.xl,
    },
    inviteTitle: {
      fontSize: theme.typography.body1.fontSize,
      fontWeight: "600" as const,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.sm,
      textAlign: "center" as const,
    },
    inviteDescription: {
      fontSize: theme.typography.body2.fontSize,
      color: theme.colors.text.secondary,
      textAlign: "center" as const,
      marginBottom: theme.spacing.md,
    },
    optionButtons: {
      flexDirection: "row" as const,
      gap: theme.spacing.sm,
    },
    optionButton: {
      flex: 1,
    },
    divider: {
      height: 1,
      backgroundColor: theme.colors.border,
      marginVertical: theme.spacing.xl,
    },
    dividerText: {
      fontSize: theme.typography.body2.fontSize,
      color: theme.colors.text.muted,
      textAlign: "center" as const,
      backgroundColor: theme.colors.background,
      paddingHorizontal: theme.spacing.md,
      marginTop: -10,
    },
    roleContainer: {
      marginVertical: theme.spacing.lg,
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

  useEffect(() => {
    if (childId && isEditing) {
      loadChild();
    }
  }, [childId, isEditing]);

  const loadChild = async () => {
    if (!childId) return;

    setIsLoading(true);
    try {
      const response = await childrenApi.getChild(childId);
      setChild(response.child);
      setFormData({
        name: response.child.name,
        birthDate: response.child.birthDate,
        gender: response.child.gender,
        role: "owner", // 기존 아이를 편집할 때는 role을 유지
      });
    } catch (error: any) {
      Alert.alert("오류", "아이 정보를 불러오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      if (isEditing && childId) {
        await childrenApi.updateChild(childId, formData);
        Alert.alert("성공", "아이 정보가 업데이트되었습니다.", [
          { text: "확인", onPress: () => navigation.goBack() },
        ]);
      } else {
        // Create child profile
        const childData = {
          ...formData,
          role: "owner" as const, // 아이를 생성하는 사용자는 owner가 됨
        };
        await childrenApi.createChild(childData);

        Alert.alert("성공", "아이 프로필이 생성되었습니다!", [
          { text: "확인", onPress: () => navigation.navigate("MainTabs") },
        ]);
      }
    } catch (error: any) {
      Alert.alert(
        "오류",
        error.message || "아이 프로필 저장 중 오류가 발생했습니다.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinChild = async () => {
    if (!inviteCode.trim()) {
      Alert.alert("오류", "초대 코드를 입력해주세요.");
      return;
    }

    setIsLoading(true);
    try {
      const { child } = await childrenApi.joinChild({
        inviteCode: inviteCode.trim(),
        role: selectedRole,
      });
      const roleText = selectedRole === "guardian" ? "보호자" : "관람자";
      Alert.alert("성공", `${child.name}의 ${roleText}로 등록되었습니다!`, [
        { text: "확인", onPress: () => navigation.navigate("MainTabs") },
      ]);
    } catch (error: any) {
      Alert.alert("오류", error.message || "초대 코드가 올바르지 않습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    if (!childId) return;

    Alert.alert(
      "아이 프로필 삭제",
      "정말로 이 아이의 프로필과 모든 기록을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.",
      [
        { text: "취소", style: "cancel" },
        {
          text: "삭제",
          style: "destructive",
          onPress: async () => {
            setIsLoading(true);
            try {
              await childrenApi.deleteChild(childId);
              Alert.alert("삭제 완료", "아이 프로필이 삭제되었습니다.", [
                {
                  text: "확인",
                  onPress: () => navigation.navigate("MainTabs"),
                },
              ]);
            } catch (error: any) {
              Alert.alert("오류", "삭제 중 오류가 발생했습니다.");
            } finally {
              setIsLoading(false);
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {isEditing
              ? "아이 정보 수정"
              : isFirstChild
                ? "아이 프로필 만들기"
                : "새 아이 프로필"}
          </Text>
          <Text style={styles.subtitle}>
            {isEditing
              ? "아이의 정보를 수정해주세요"
              : isFirstChild
                ? "회원가입을 완료하려면 아이 프로필을 만들거나 기존 아이에 참여하세요"
                : "소중한 아이의 정보를 입력해주세요"}
          </Text>
        </View>

        {isFirstChild && !isEditing && (
          <View style={styles.inviteSection}>
            <Text style={styles.inviteTitle}>어떻게 시작하시겠어요?</Text>
            <Text style={styles.inviteDescription}>
              새로운 아이의 프로필을 만들거나, 파트너가 보낸 초대 코드로 기존
              아이에 참여할 수 있습니다.
            </Text>
            <View style={styles.optionButtons}>
              <Button
                title="새 프로필 만들기"
                variant={!showInviteOption ? "primary" : "outline"}
                buttonStyle={styles.optionButton}
                onPress={() => setShowInviteOption(false)}
                loading={isLoading}
              />
              <Button
                title="초대 코드로 참여"
                variant={showInviteOption ? "primary" : "outline"}
                buttonStyle={styles.optionButton}
                onPress={() => setShowInviteOption(true)}
                loading={isLoading}
              />
            </View>
          </View>
        )}

        {showInviteOption && isFirstChild ? (
          <Card>
            <Input
              label="초대 코드"
              value={inviteCode}
              onChangeText={setInviteCode}
              placeholder="파트너가 보낸 초대 코드를 입력하세요"
              autoCapitalize="characters"
            />

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
                title="아이에게 참여하기"
                onPress={handleJoinChild}
                loading={isLoading}
                disabled={isLoading || !inviteCode.trim()}
              />
            </View>
          </Card>
        ) : (
          <>
            {isFirstChild && (
              <>
                <View style={styles.divider} />
                <Text style={styles.dividerText}>또는</Text>
              </>
            )}

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
                    variant={
                      formData.gender === "female" ? "primary" : "outline"
                    }
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
                  title={isEditing ? "정보 업데이트" : "프로필 생성"}
                  onPress={handleSave}
                  loading={isLoading}
                />

                {isEditing && (
                  <Button
                    title="프로필 삭제"
                    variant="outline"
                    buttonStyle={styles.deleteButton}
                    onPress={handleDelete}
                    loading={isLoading}
                  />
                )}
              </View>
            </Card>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
