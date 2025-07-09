import { GENDERS, GUARDIAN_ROLES, type CreateChildRequest } from "@daon/shared";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Controller, useForm } from "react-hook-form";
import { Alert, Platform, ScrollView, Text, View } from "react-native";
import { useChildrenQuery } from "../../shared/api/children/hooks/useChildrenQuery";
import { useCreateChild } from "../../shared/api/children/hooks/useCreateChild";
import { SCREEN_PADDING } from "../../shared/config/theme";
import { useThemedStyles } from "../../shared/lib/hooks/useTheme";
import type { ChildFormData } from "../../shared/types/child.forms";
import { ChildFormSchema } from "../../shared/types/child.forms";
import Button from "../../shared/ui/Button/Button";
import Card from "../../shared/ui/Card/Card";
import ImagePicker from "../../shared/ui/ImagePicker";
import Input from "../../shared/ui/Input/Input";

interface CreateChildFormProps {
  onSuccess?: (childData: unknown) => void;
  onError?: (error: unknown) => void;
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

  // React Hook Form
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ChildFormData>({
    resolver: zodResolver(ChildFormSchema),
    defaultValues: {
      name: "",
      birthDate: format(new Date(), "yyyy-MM-dd"),
      gender: null,
      photoUrl: null,
      birthWeight: null,
      birthHeight: null,
    },
  });

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
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
    },
    subtitle: {
      fontSize: theme.typography.subtitle.fontSize,
      color: theme.colors.textSecondary,
      textAlign: "center" as const,
    },
    genderContainer: {
      marginBottom: theme.spacing.md,
    },
    genderLabel: {
      fontSize: theme.typography.body2.fontSize,
      fontWeight: "500" as const,
      color: theme.colors.text,
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

  const onSubmit = async (data: ChildFormData) => {
    const childData: CreateChildRequest = {
      ...data,
      role: GUARDIAN_ROLES.OWNER,
    };

    createChildMutation.mutate(childData, {
      onSuccess: (response) => {
        if (onSuccess) {
          onSuccess(response);
        } else {
          Alert.alert("성공", "아이 프로필이 생성되었습니다!");
        }
      },
      onError: (error) => {
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
          <Controller
            control={control}
            name="name"
            render={({ field: { value, onChange } }) => (
              <Input
                label="아이 이름"
                value={value}
                onChangeText={onChange}
                error={errors.name?.message}
                placeholder="예: 다온이"
              />
            )}
          />

          <Controller
            control={control}
            name="birthDate"
            render={({ field: { value, onChange } }) => (
              <Input
                label="생년월일 (또는 출산예정일)"
                value={value || ""}
                onChangeText={onChange}
                error={errors.birthDate?.message}
                placeholder="YYYY-MM-DD"
                keyboardType={
                  Platform.OS === "ios" ? "numbers-and-punctuation" : "numeric"
                }
              />
            )}
          />

          <Controller
            control={control}
            name="gender"
            render={({ field: { value, onChange } }) => (
              <View style={styles.genderContainer}>
                <Text style={styles.genderLabel}>성별 (선택사항)</Text>
                <View style={styles.genderButtons}>
                  <Button
                    title="남아"
                    variant={value === GENDERS.MALE ? "primary" : "outline"}
                    size="small"
                    className="flex-1 mx-1"
                    onPress={() => onChange(GENDERS.MALE)}
                    loading={isLoading}
                  />
                  <Button
                    title="여아"
                    variant={value === GENDERS.FEMALE ? "primary" : "outline"}
                    size="small"
                    className="flex-1 mx-1"
                    onPress={() => onChange(GENDERS.FEMALE)}
                    loading={isLoading}
                  />
                </View>
              </View>
            )}
          />

          <Controller
            control={control}
            name="photoUrl"
            render={({ field: { value, onChange } }) => (
              <ImagePicker
                label="아이 사진"
                value={value}
                onImageSelected={onChange}
                error={errors.photoUrl?.message}
                placeholder="아이의 사진을 선택해주세요"
              />
            )}
          />

          <Controller
            control={control}
            name="birthWeight"
            render={({ field: { value, onChange } }) => (
              <Input
                label="첫 몸무게 (kg)"
                value={value?.toString() ?? ""}
                onChangeText={onChange}
                error={errors.birthWeight?.message}
                placeholder="예: 3.2"
                keyboardType="numeric"
              />
            )}
          />

          <Controller
            control={control}
            name="birthHeight"
            render={({ field: { value, onChange } }) => (
              <Input
                label="첫 키 (cm)"
                value={value?.toString() ?? ""}
                onChangeText={onChange}
                error={errors.birthHeight?.message}
                placeholder="예: 50.5"
                keyboardType="numeric"
              />
            )}
          />

          <View style={styles.buttonContainer}>
            <Button
              title="프로필 생성"
              onPress={handleSubmit(onSubmit)}
              loading={isLoading}
            />
          </View>
        </Card>
      </ScrollView>
    </View>
  );
};
