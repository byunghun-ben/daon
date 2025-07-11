import { useRouter } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CreateChildForm, JoinChildForm } from "../../features/children";
import { useThemedStyles } from "../../shared/lib/hooks/useTheme";
import { useAuthStore } from "../../shared/store";

type TabType = "create" | "join";

export default function OnboardingChildSetupScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("create");
  const { refreshAuth } = useAuthStore();

  const styles = useThemedStyles((theme) =>
    StyleSheet.create({
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
        color: theme.colors.text,
        textAlign: "center",
      },
      subtitle: {
        fontSize: theme.typography.body1.fontSize,
        color: theme.colors.textSecondary,
        textAlign: "center",
        marginTop: theme.spacing.sm,
        lineHeight: theme.typography.body1.lineHeight,
      },
      tabContainer: {
        flexDirection: "row",
        backgroundColor: theme.colors.surface,
        margin: theme.spacing.lg,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.xs,
      },
      tabButton: {
        flex: 1,
        paddingVertical: theme.spacing.sm,
        paddingHorizontal: theme.spacing.md,
        borderRadius: theme.borderRadius.sm,
        alignItems: "center",
      },
      activeTabButton: {
        backgroundColor: theme.colors.primary,
      },
      tabText: {
        fontSize: theme.typography.body2.fontSize,
        fontWeight: "500",
        color: theme.colors.textSecondary,
      },
      activeTabText: {
        color: theme.colors.white,
      },
      content: {
        flex: 1,
        padding: theme.spacing.lg,
      },
    }),
  );

  const handleSuccess = async () => {
    // 사용자 정보 새로고침 (registration_status가 completed로 업데이트됨)
    await refreshAuth();

    // 온보딩 완료 후 메인 화면으로 이동
    console.log("[OnboardingChildSetupScreen] Redirecting to tabs");
    router.replace("/(tabs)");
  };

  return (
    <SafeAreaView style={styles.container}>
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
              새로운 아이를 등록하거나{"\n"}
              기존 아이의 관리자로 참여하세요
            </Text>
          </View>

          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === "create" && styles.activeTabButton,
              ]}
              onPress={() => setActiveTab("create")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "create" && styles.activeTabText,
                ]}
              >
                새 아이 등록
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === "join" && styles.activeTabButton,
              ]}
              onPress={() => setActiveTab("join")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "join" && styles.activeTabText,
                ]}
              >
                기존 아이 참여
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            {activeTab === "create" ? (
              <CreateChildForm onSuccess={handleSuccess} />
            ) : (
              <JoinChildForm onSuccess={handleSuccess} />
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
