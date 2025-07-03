import React from "react";
import {
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Stack } from "expo-router";
import { useThemedStyles } from "../../shared/lib/hooks/useTheme";
import { useThemeStore, ThemeMode } from "../../shared/store/theme.store";
import Card from "../../shared/ui/Card";
import { IconSymbol } from "../../components/ui/IconSymbol";

export default function ThemeSettingsScreen() {
  const { mode, setMode } = useThemeStore();

  const styles = useThemedStyles((theme) => ({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      padding: theme.spacing.lg,
    },
    header: {
      marginBottom: theme.spacing.xl,
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
    option: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      padding: theme.spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    optionLast: {
      borderBottomWidth: 0,
    },
    optionContent: {
      flex: 1,
      marginLeft: theme.spacing.md,
    },
    optionTitle: {
      fontSize: theme.typography.body1.fontSize,
      fontWeight: "600" as const,
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
    },
    optionDescription: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.textSecondary,
      lineHeight: 16,
    },
    checkIcon: {
      marginLeft: theme.spacing.md,
    },
    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: "center" as const,
      alignItems: "center" as const,
    },
    lightIcon: {
      backgroundColor: "#FFF3E0",
    },
    darkIcon: {
      backgroundColor: "#263238",
    },
    systemIcon: {
      backgroundColor: theme.colors.primary + "20",
    },
  }));

  const themeOptions: Array<{
    mode: ThemeMode;
    title: string;
    description: string;
    icon: string;
    iconStyle: any;
  }> = [
    {
      mode: "light",
      title: "라이트 모드",
      description: "밝은 테마로 앱을 표시합니다",
      icon: "sun.max.fill",
      iconStyle: styles.lightIcon,
    },
    {
      mode: "dark",
      title: "다크 모드",
      description: "어두운 테마로 앱을 표시합니다",
      icon: "moon.fill",
      iconStyle: styles.darkIcon,
    },
    {
      mode: "system",
      title: "시스템 설정 따라가기",
      description: "시스템의 다크 모드 설정을 자동으로 따라갑니다",
      icon: "gear",
      iconStyle: styles.systemIcon,
    },
  ];

  const handleThemeChange = (selectedMode: ThemeMode) => {
    setMode(selectedMode);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: "테마 설정",
          headerStyle: {
            backgroundColor: styles.container.backgroundColor,
          },
          headerTitleStyle: {
            color: styles.title.color,
          },
        }}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>테마 설정</Text>
          <Text style={styles.subtitle}>
            앱의 테마를 선택하여 사용자 경험을 개선할 수 있습니다
          </Text>
        </View>

        <Card>
          {themeOptions.map((option, index) => (
            <TouchableOpacity
              key={option.mode}
              style={[
                styles.option,
                index === themeOptions.length - 1 && styles.optionLast,
              ]}
              onPress={() => handleThemeChange(option.mode)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, option.iconStyle]}>
                <IconSymbol
                  name={option.icon}
                  size={20}
                  color={option.mode === "dark" ? "#ffffff" : "#666666"}
                />
              </View>

              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.optionDescription}>
                  {option.description}
                </Text>
              </View>

              {mode === option.mode && (
                <View style={styles.checkIcon}>
                  <IconSymbol
                    name="checkmark.circle.fill"
                    size={24}
                    color="#4CAF50"
                  />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </Card>

        <View style={{ height: 50 }} />
      </ScrollView>
    </SafeAreaView>
  );
}