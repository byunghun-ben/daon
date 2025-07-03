import { useRouter } from "expo-router";
import {
  SafeAreaView,
  ScrollView,
  Text,
  View,
  RefreshControl,
} from "react-native";
import { DiaryEntryCard } from "../../entities";
import { useDiaryEntries } from "../../shared/api/diary/hooks";
import { SCREEN_PADDING } from "../../shared/config/theme";
import { useActiveChild } from "../../shared/hooks/useActiveChild";
import { useThemedStyles } from "../../shared/lib/hooks/useTheme";
import { Button } from "../../shared/ui";
import Card from "../../shared/ui/Card";
import type { DiaryEntry } from "@daon/shared";

export default function DiaryScreen() {
  const router = useRouter();
  const { activeChild } = useActiveChild();

  const {
    data: diaryData,
    isLoading,
    isError,
    refetch,
  } = useDiaryEntries(
    activeChild ? { childId: activeChild.id, limit: 20, offset: 0 } : undefined,
  );

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
    emptyState: {
      alignItems: "center" as const,
      justifyContent: "center" as const,
      padding: theme.spacing.xxl,
    },
    emptyText: {
      fontSize: theme.typography.body1.fontSize,
      color: theme.colors.textSecondary,
      textAlign: "center" as const,
      marginBottom: theme.spacing.lg,
    },
    diaryItem: {
      marginBottom: theme.spacing.md,
    },
    diaryHeader: {
      flexDirection: "row" as const,
      justifyContent: "space-between" as const,
      alignItems: "flex-start" as const,
      marginBottom: theme.spacing.sm,
    },
    diaryDate: {
      fontSize: theme.typography.body2.fontSize,
      color: theme.colors.textSecondary,
      fontWeight: "600" as const,
    },
    diaryContent: {
      fontSize: theme.typography.body1.fontSize,
      color: theme.colors.text,
      lineHeight: theme.typography.body1.lineHeight,
      marginBottom: theme.spacing.sm,
    },
    diaryPhotos: {
      flexDirection: "row" as const,
      gap: theme.spacing.xs,
      marginBottom: theme.spacing.sm,
    },
    diaryPhoto: {
      width: 60,
      height: 60,
      borderRadius: theme.borderRadius.sm,
    },
    photoCount: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.textSecondary,
    },
    milestoneTag: {
      backgroundColor: `${theme.colors.primary  }20`,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.sm,
      alignSelf: "flex-start" as const,
    },
    milestoneText: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.primary,
      fontWeight: "600" as const,
    },
    loadingText: {
      textAlign: "center" as const,
      color: theme.colors.textSecondary,
      padding: theme.spacing.lg,
    },
    errorText: {
      textAlign: "center" as const,
      color: theme.colors.error,
      padding: theme.spacing.lg,
    },
  }));

  if (!activeChild) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>성장 일기</Text>
          <Text style={styles.subtitle}>아이를 먼저 등록해주세요</Text>
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

  const renderDiaryItem = (diaryEntry: DiaryEntry) => (
    <DiaryEntryCard
      key={diaryEntry.id}
      diaryEntry={diaryEntry}
      onPress={(entry) => router.push(`/diary/${entry.id}`)}
      showUser={false}
      maxContentLength={100}
    />
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>성장 일기</Text>
          <Text style={styles.subtitle}>
            {activeChild?.name}의 소중한 순간들을 기록해보세요
          </Text>
        </View>
        <Text style={styles.loadingText}>일기를 불러오는 중...</Text>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>성장 일기</Text>
          <Text style={styles.subtitle}>
            {activeChild?.name}의 소중한 순간들을 기록해보세요
          </Text>
        </View>
        <Text style={styles.errorText}>
          일기를 불러오는 중 오류가 발생했습니다.
        </Text>
        <Button title="다시 시도" onPress={() => refetch()} variant="primary" />
      </SafeAreaView>
    );
  }

  const diaryEntries = diaryData?.diaryEntries || [];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>성장 일기</Text>
        <Text style={styles.subtitle}>
          {activeChild?.name}의 소중한 순간들을 기록해보세요
        </Text>
      </View>

      {diaryEntries.length === 0 ? (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Card>
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                아직 작성된 일기가 없습니다.{"\n"}첫 번째 일기를 작성해보세요!
              </Text>
              <Button
                title="일기 작성하기"
                onPress={() => router.push("/diary/new")}
                variant="primary"
              />
            </View>
          </Card>
        </ScrollView>
      ) : (
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={refetch} />
          }
        >
          {diaryEntries.map(renderDiaryItem)}

          <View style={{ marginTop: SCREEN_PADDING }}>
            <Button
              title="새 일기 작성"
              onPress={() => router.push("/diary/new")}
              variant="primary"
            />
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
