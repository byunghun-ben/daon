import React from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { useThemedStyles } from "../../shared/lib/hooks/useTheme";
import { SCREEN_PADDING } from "../../shared/config/theme";
import Button from "../../shared/ui/Button";
import Card from "../../shared/ui/Card";
import { useActiveChild } from "../../shared/hooks/useActiveChild";

export default function GrowthScreen() {
  const router = useRouter();
  const { activeChild } = useActiveChild();

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
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.sm,
    },
    subtitle: {
      fontSize: theme.typography.body2.fontSize,
      color: theme.colors.text.secondary,
    },
    content: {
      flex: 1,
      padding: SCREEN_PADDING,
    },
    emptyState: {
      alignItems: "center" as const,
      justifyContent: "center" as const,
      padding: theme.spacing.xxl,
    },
    emptyText: {
      fontSize: theme.typography.body1.fontSize,
      color: theme.colors.text.secondary,
      textAlign: "center" as const,
      marginBottom: theme.spacing.lg,
    },
  }));

  if (!activeChild) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>성장 기록</Text>
          <Text style={styles.subtitle}>
            아이를 먼저 등록해주세요
          </Text>
        </View>
        <View style={styles.content}>
          <Card>
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                등록된 아이가 없습니다.{"\n"}
                먼저 아이를 등록해주세요.
              </Text>
              <Button
                title="아이 등록하기"
                onPress={() => router.push("/children/create")}
                variant="primary"
              />
            </View>
          </Card>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>성장 기록</Text>
        <Text style={styles.subtitle}>
          {activeChild.name}의 성장 과정을 차트로 확인해보세요
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Card>
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              아직 기록된 성장 데이터가 없습니다.{"\n"}
              첫 번째 성장 기록을 추가해보세요!
            </Text>
            <Button
              title="성장 기록 추가"
              onPress={() => router.push("/growth/new")}
              variant="primary"
            />
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}