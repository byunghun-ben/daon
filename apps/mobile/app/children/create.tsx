import { useRouter } from "expo-router";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { CreateChildForm } from "../../features/children";
import { useThemedStyles } from "../../shared/lib/hooks/useTheme";

export default function CreateChildScreen() {
  const router = useRouter();

  const styles = useThemedStyles((theme) => ({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      padding: theme.spacing.lg,
      paddingBottom: theme.spacing.md,
    },
    title: {
      fontSize: theme.typography.title.fontSize,
      fontWeight: theme.typography.title.fontWeight,
      color: theme.colors.text.primary,
      textAlign: "center" as const,
    },
    subtitle: {
      fontSize: theme.typography.body1.fontSize,
      color: theme.colors.text.secondary,
      textAlign: "center" as const,
      marginTop: theme.spacing.sm,
      lineHeight: theme.typography.body1.lineHeight,
    },
    content: {
      flex: 1,
      padding: theme.spacing.lg,
    },
  }));

  const handleSuccess = () => {
    // 아이 생성 성공 후 메인 화면으로 이동
    router.replace("/(tabs)");
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>아이 프로필 만들기</Text>
          <Text style={styles.subtitle}>
            아이의 기본 정보를 입력해주세요{"\n"}
            나중에 언제든지 수정할 수 있어요
          </Text>
        </View>

        <View style={styles.content}>
          <CreateChildForm onSuccess={handleSuccess} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
