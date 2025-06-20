import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  Alert,
  Platform,
} from "react-native";
import { useThemedStyles } from "../../shared/lib/hooks/useTheme";
import { SCREEN_PADDING } from "../../shared/config/theme";
import Button from "../../shared/ui/Button";
import Input from "../../shared/ui/Input";
import Card from "../../shared/ui/Card";
import { childrenApi, type CreateChildRequest, type Child } from "../../shared/api/children";

interface ChildProfileScreenProps {
  navigation: any;
  route?: {
    params?: {
      childId?: string;
      isEditing?: boolean;
    };
  };
}

export default function ChildProfileScreen({ navigation, route }: ChildProfileScreenProps) {
  const { childId, isEditing = false } = route?.params || {};
  const [formData, setFormData] = useState<CreateChildRequest>({
    name: "",
    birth_date: "",
    gender: undefined,
  });
  const [errors, setErrors] = useState<Partial<CreateChildRequest>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [child, setChild] = useState<Child | null>(null);

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
        birth_date: response.child.birth_date,
        gender: response.child.gender,
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

    if (!formData.birth_date.trim()) {
      newErrors.birth_date = "생년월일을 입력해주세요";
    } else {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(formData.birth_date)) {
        newErrors.birth_date = "YYYY-MM-DD 형식으로 입력해주세요";
      } else {
        const birthDate = new Date(formData.birth_date);
        const now = new Date();
        const maxFutureDate = new Date();
        maxFutureDate.setMonth(now.getMonth() + 10); // Allow up to 10 months in the future for pregnancy

        if (isNaN(birthDate.getTime())) {
          newErrors.birth_date = "올바른 날짜를 입력해주세요";
        } else if (birthDate > maxFutureDate) {
          newErrors.birth_date = "출산예정일이 너무 멀리 설정되었습니다";
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
        await childrenApi.createChild(formData);
        Alert.alert("성공", "아이 프로필이 생성되었습니다!", [
          { text: "확인", onPress: () => navigation.navigate("MainTabs") },
        ]);
      }
    } catch (error: any) {
      Alert.alert(
        "오류",
        error.message || "아이 프로필 저장 중 오류가 발생했습니다."
      );
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
                { text: "확인", onPress: () => navigation.navigate("MainTabs") },
              ]);
            } catch (error: any) {
              Alert.alert("오류", "삭제 중 오류가 발생했습니다.");
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {isEditing ? "아이 정보 수정" : "새 아이 프로필"}
          </Text>
          <Text style={styles.subtitle}>
            {isEditing 
              ? "아이의 정보를 수정해주세요" 
              : "소중한 아이의 정보를 입력해주세요"
            }
          </Text>
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
            value={formData.birth_date}
            onChangeText={(birth_date) => setFormData({ ...formData, birth_date })}
            error={errors.birth_date}
            placeholder="YYYY-MM-DD"
            keyboardType={Platform.OS === "ios" ? "numbers-and-punctuation" : "numeric"}
          />

          <View style={styles.genderContainer}>
            <Text style={styles.genderLabel}>성별 (선택사항)</Text>
            <View style={styles.genderButtons}>
              <Button
                title="남아"
                variant={formData.gender === "male" ? "primary" : "outline"}
                size="small"
                buttonStyle={styles.genderButton}
                onPress={() => setFormData({ 
                  ...formData, 
                  gender: formData.gender === "male" ? undefined : "male" 
                })}
              />
              <Button
                title="여아"
                variant={formData.gender === "female" ? "primary" : "outline"}
                size="small"
                buttonStyle={styles.genderButton}
                onPress={() => setFormData({ 
                  ...formData, 
                  gender: formData.gender === "female" ? undefined : "female" 
                })}
              />
              <Button
                title="기타"
                variant={formData.gender === "other" ? "primary" : "outline"}
                size="small"
                buttonStyle={styles.genderButton}
                onPress={() => setFormData({ 
                  ...formData, 
                  gender: formData.gender === "other" ? undefined : "other" 
                })}
              />
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <Button
              title={isLoading ? "저장 중..." : isEditing ? "정보 업데이트" : "프로필 생성"}
              onPress={handleSave}
              disabled={isLoading}
            />

            {isEditing && (
              <Button
                title="프로필 삭제"
                variant="outline"
                buttonStyle={styles.deleteButton}
                onPress={handleDelete}
                disabled={isLoading}
              />
            )}
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}