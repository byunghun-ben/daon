import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  Text,
  View,
  Switch,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Stack } from "expo-router";
import { useThemedStyles } from "../../shared/lib/hooks/useTheme";
import Card from "../../shared/ui/Card";
import { IconSymbol } from "../../components/ui/IconSymbol";
import AsyncStorage from "@react-native-async-storage/async-storage";

type FontSize = "small" | "normal" | "large" | "extraLarge";
type ContrastMode = "normal" | "high";

interface AccessibilitySettings {
  reduceMotion: boolean;
  fontSize: FontSize;
  highContrast: boolean;
  announceNotifications: boolean;
  hapticFeedback: boolean;
}

export default function AccessibilitySettingsScreen() {
  const [settings, setSettings] = useState<AccessibilitySettings>({
    reduceMotion: false,
    fontSize: "normal",
    highContrast: false,
    announceNotifications: true,
    hapticFeedback: true,
  });

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
      lineHeight: 20,
    },
    section: {
      marginBottom: theme.spacing.lg,
    },
    sectionTitle: {
      fontSize: theme.typography.subtitle.fontSize,
      fontWeight: "600" as const,
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
    },
    settingRow: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      padding: theme.spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    settingRowLast: {
      borderBottomWidth: 0,
    },
    settingContent: {
      flex: 1,
      marginRight: theme.spacing.md,
    },
    settingTitle: {
      fontSize: theme.typography.body1.fontSize,
      fontWeight: "600" as const,
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
    },
    settingDescription: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.textSecondary,
      lineHeight: 16,
    },
    fontSizeSelector: {
      flexDirection: "row" as const,
      flexWrap: "wrap" as const,
      gap: theme.spacing.sm,
      marginTop: theme.spacing.sm,
    },
    fontSizeOption: {
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    fontSizeOptionActive: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primary + "10",
    },
    fontSizeText: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.text,
    },
    fontSizeTextActive: {
      color: theme.colors.primary,
      fontWeight: "600" as const,
    },
  }));

  const fontSizeOptions: Array<{
    value: FontSize;
    label: string;
    description: string;
  }> = [
    { value: "small", label: "작게", description: "12pt" },
    { value: "normal", label: "보통", description: "16pt" },
    { value: "large", label: "크게", description: "20pt" },
    { value: "extraLarge", label: "매우 크게", description: "24pt" },
  ];

  const updateSetting = async <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    
    try {
      await AsyncStorage.setItem(
        "accessibility-settings",
        JSON.stringify(newSettings)
      );
    } catch (error) {
      console.error("Failed to save accessibility settings:", error);
    }
  };

  const showFontSizeInfo = () => {
    Alert.alert(
      "폰트 크기 설정",
      "폰트 크기를 변경하면 앱의 모든 텍스트 크기가 조정됩니다. 시각적 접근성을 향상시키는 데 도움이 됩니다.",
      [{ text: "확인" }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: "접근성",
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
          <Text style={styles.title}>접근성</Text>
          <Text style={styles.subtitle}>
            시각, 청각, 운동 능력에 관계없이 모든 사용자가 앱을 쉽게 사용할 수 있도록 도와주는 설정입니다.
          </Text>
        </View>

        {/* 시각적 설정 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>시각적 접근성</Text>
          <Card>
            <View style={styles.settingRow}>
              <View style={styles.settingContent}>
                <View style={{ flexDirection: "row" as const, alignItems: "center" as const }}>
                  <Text style={styles.settingTitle}>폰트 크기</Text>
                  <TouchableOpacity 
                    onPress={showFontSizeInfo}
                    accessibilityLabel="폰트 크기 설정 도움말"
                    accessibilityHint="폰트 크기 설정에 대한 자세한 정보를 확인합니다"
                    style={{ marginLeft: 8 }}
                  >
                    <IconSymbol name="info.circle" size={16} color="#666" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.settingDescription}>
                  앱 전체의 텍스트 크기를 조정합니다
                </Text>
                <View style={styles.fontSizeSelector}>
                  {fontSizeOptions.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.fontSizeOption,
                        settings.fontSize === option.value &&
                          styles.fontSizeOptionActive,
                      ]}
                      onPress={() => updateSetting("fontSize", option.value)}
                      accessibilityLabel={`폰트 크기 ${option.label}`}
                      accessibilityHint={`${option.description} 크기로 폰트를 설정합니다`}
                      accessibilityState={{
                        selected: settings.fontSize === option.value,
                      }}
                    >
                      <Text
                        style={[
                          styles.fontSizeText,
                          settings.fontSize === option.value &&
                            styles.fontSizeTextActive,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <View style={[styles.settingRow, styles.settingRowLast]}>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>고대비 모드</Text>
                <Text style={styles.settingDescription}>
                  텍스트와 배경 간의 대비를 높여 가독성을 향상시킵니다
                </Text>
              </View>
              <Switch
                value={settings.highContrast}
                onValueChange={(value) => updateSetting("highContrast", value)}
                accessibilityLabel="고대비 모드"
                accessibilityHint="텍스트와 배경의 대비를 높입니다"
              />
            </View>
          </Card>
        </View>

        {/* 모션 설정 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>모션 및 애니메이션</Text>
          <Card>
            <View style={[styles.settingRow, styles.settingRowLast]}>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>모션 줄이기</Text>
                <Text style={styles.settingDescription}>
                  화면 전환 및 애니메이션 효과를 최소화합니다
                </Text>
              </View>
              <Switch
                value={settings.reduceMotion}
                onValueChange={(value) => updateSetting("reduceMotion", value)}
                accessibilityLabel="모션 줄이기"
                accessibilityHint="앱의 애니메이션 효과를 줄입니다"
              />
            </View>
          </Card>
        </View>

        {/* 피드백 설정 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>피드백</Text>
          <Card>
            <View style={styles.settingRow}>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>햅틱 피드백</Text>
                <Text style={styles.settingDescription}>
                  버튼 탭과 같은 상호작용에서 진동 피드백을 제공합니다
                </Text>
              </View>
              <Switch
                value={settings.hapticFeedback}
                onValueChange={(value) => updateSetting("hapticFeedback", value)}
                accessibilityLabel="햅틱 피드백"
                accessibilityHint="터치 시 진동 피드백을 활성화합니다"
              />
            </View>

            <View style={[styles.settingRow, styles.settingRowLast]}>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>알림 음성 안내</Text>
                <Text style={styles.settingDescription}>
                  푸시 알림 내용을 음성으로 읽어줍니다
                </Text>
              </View>
              <Switch
                value={settings.announceNotifications}
                onValueChange={(value) =>
                  updateSetting("announceNotifications", value)
                }
                accessibilityLabel="알림 음성 안내"
                accessibilityHint="알림 내용을 음성으로 읽어줍니다"
              />
            </View>
          </Card>
        </View>

        <View style={{ height: 50 }} />
      </ScrollView>
    </SafeAreaView>
  );
}