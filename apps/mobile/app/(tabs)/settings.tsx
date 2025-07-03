import { useAuthStore } from "@/shared/store";
import { useRouter } from "expo-router";
import React from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SCREEN_PADDING } from "../../shared/config/theme";
import { useThemedStyles } from "../../shared/lib/hooks/useTheme";
import Button from "../../shared/ui/Button";
import Card from "../../shared/ui/Card";

export default function SettingsScreen() {
  const router = useRouter();
  const { signOut } = useAuthStore();

  const handleLogout = () => {
    Alert.alert("로그아웃", "정말 로그아웃하시겠습니까?", [
      {
        text: "취소",
        style: "cancel",
      },
      {
        text: "로그아웃",
        style: "destructive",
        onPress: () => {
          signOut();
        },
      },
    ]);
  };

  const styles = useThemedStyles((theme) => ({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      padding: SCREEN_PADDING,
      paddingBottom: theme.spacing.md,
    },
    title: {
      fontSize: theme.typography.title.fontSize,
      fontWeight: theme.typography.title.fontWeight,
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
    },
    subtitle: {
      fontSize: theme.typography.body2.fontSize,
      color: theme.colors.textSecondary,
    },
    content: {
      flex: 1,
      padding: SCREEN_PADDING,
    },
    section: {
      marginBottom: theme.spacing.xl,
    },
    sectionTitle: {
      fontSize: theme.typography.subtitle.fontSize,
      fontWeight: theme.typography.subtitle.fontWeight,
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
    },
    menuItem: {
      padding: theme.spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    menuItemLast: {
      borderBottomWidth: 0,
    },
    menuItemText: {
      fontSize: theme.typography.body1.fontSize,
      color: theme.colors.text,
    },
    menuItemSubtext: {
      fontSize: theme.typography.body2.fontSize,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.xs,
    },
    logoutButton: {
      marginTop: theme.spacing.xl,
    },
  }));

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>설정</Text>
        <Text style={styles.subtitle}>앱 설정 및 계정 관리</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 계정 설정 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>계정</Text>
          <Card>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push("/profile/edit")}
            >
              <Text style={styles.menuItemText}>프로필 수정</Text>
              <Text style={styles.menuItemSubtext}>
                이름, 이메일 등 기본 정보 수정
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.menuItem, styles.menuItemLast]}
              onPress={() => router.push("/children/list")}
            >
              <Text style={styles.menuItemText}>아이 관리</Text>
              <Text style={styles.menuItemSubtext}>
                등록된 아이 정보 보기 및 수정
              </Text>
            </TouchableOpacity>
          </Card>
        </View>

        {/* 앱 설정 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>앱 설정</Text>
          <Card>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push("/settings/theme")}
            >
              <Text style={styles.menuItemText}>테마 설정</Text>
              <Text style={styles.menuItemSubtext}>
                라이트/다크 모드 및 시스템 설정 따라가기
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push("/settings/accessibility")}
            >
              <Text style={styles.menuItemText}>접근성</Text>
              <Text style={styles.menuItemSubtext}>
                폰트 크기, 고대비 모드, 모션 설정
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push("/settings/notifications")}
            >
              <Text style={styles.menuItemText}>알림 설정</Text>
              <Text style={styles.menuItemSubtext}>
                푸시 알림 및 리마인더 설정
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push("/settings/privacy")}
            >
              <Text style={styles.menuItemText}>개인정보 보호</Text>
              <Text style={styles.menuItemSubtext}>
                데이터 보안 및 개인정보 설정
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.menuItem, styles.menuItemLast]}
              onPress={() => router.push("/settings/backup")}
            >
              <Text style={styles.menuItemText}>백업 및 동기화</Text>
              <Text style={styles.menuItemSubtext}>
                데이터 백업 및 기기 간 동기화
              </Text>
            </TouchableOpacity>
          </Card>
        </View>

        {/* 지원 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>지원</Text>
          <Card>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push("/support/help")}
            >
              <Text style={styles.menuItemText}>도움말</Text>
              <Text style={styles.menuItemSubtext}>
                사용법 및 자주 묻는 질문
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push("/support/contact")}
            >
              <Text style={styles.menuItemText}>문의하기</Text>
              <Text style={styles.menuItemSubtext}>버그 신고 및 기능 제안</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.menuItem, styles.menuItemLast]}
              onPress={() => router.push("/about")}
            >
              <Text style={styles.menuItemText}>앱 정보</Text>
              <Text style={styles.menuItemSubtext}>버전 정보 및 라이선스</Text>
            </TouchableOpacity>
          </Card>
        </View>

        {/* 로그아웃 */}
        <View style={styles.logoutButton}>
          <Button title="로그아웃" onPress={handleLogout} variant="secondary" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
