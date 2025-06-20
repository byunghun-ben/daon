import React from "react";
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { useThemedStyles } from "../../shared/lib/hooks/useTheme";
import { SCREEN_PADDING } from "../../shared/config/theme";
import Card from "../../shared/ui/Card";
import Button from "../../shared/ui/Button";

interface HomeScreenProps {
  navigation: any; // Replace with proper navigation type
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const styles = useThemedStyles((theme) => ({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      padding: SCREEN_PADDING,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    title: {
      fontSize: theme.typography.title.fontSize,
      fontWeight: theme.typography.title.fontWeight,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.xs,
    },
    subtitle: {
      fontSize: theme.typography.subtitle.fontSize,
      color: theme.colors.text.secondary,
    },
    content: {
      padding: SCREEN_PADDING,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: "600" as const,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.md,
    },
    cardContent: {
      fontSize: theme.typography.body1.fontSize,
      lineHeight: 24,
      color: theme.colors.text.secondary,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "600" as const,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.md,
    },
    emptyText: {
      fontSize: theme.typography.body2.fontSize,
      color: theme.colors.text.muted,
      textAlign: "center" as const,
      paddingVertical: SCREEN_PADDING,
    },
    quickActions: {
      flexDirection: "row" as const,
      justifyContent: "space-between" as const,
      marginBottom: theme.spacing.xl,
    },
    actionButton: {
      flex: 1,
      marginHorizontal: theme.spacing.xs,
    },
  }));

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <View style={styles.header}>
          <Text style={styles.title}>다온</Text>
          <Text style={styles.subtitle}>오늘의 활동</Text>
        </View>
        
        <View style={styles.content}>
          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <Button
              title="수유 기록"
              size="small"
              buttonStyle={styles.actionButton}
              onPress={() => navigation.navigate("Record", { type: "feeding" })}
            />
            <Button
              title="기저귀 교체"
              size="small"
              variant="secondary"
              buttonStyle={styles.actionButton}
              onPress={() => navigation.navigate("Record", { type: "diaper" })}
            />
            <Button
              title="수면 기록"
              size="small"
              variant="outline"
              buttonStyle={styles.actionButton}
              onPress={() => navigation.navigate("Record", { type: "sleep" })}
            />
          </View>

          {/* Today Summary */}
          <Card style={{ marginBottom: styles.content.padding }}>
            <Text style={styles.cardTitle}>오늘 요약</Text>
            <Text style={styles.cardContent}>
              수유: 0회{"\n"}
              수면: 0시간{"\n"}
              기저귀: 0회
            </Text>
          </Card>
          
          {/* Recent Activities */}
          <Card>
            <Text style={styles.sectionTitle}>최근 활동</Text>
            <Text style={styles.emptyText}>아직 기록된 활동이 없습니다.</Text>
            <Button
              title="첫 활동 기록하기"
              variant="outline"
              onPress={() => navigation.navigate("Record")}
            />
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

