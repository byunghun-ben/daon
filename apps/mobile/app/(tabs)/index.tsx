import type { ActivityApi } from "@daon/shared";
import { useRouter } from "expo-router";
import {
  Alert,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from "react-native";
import {
  useRecentActivities,
  useTodayActivities,
} from "../../shared/api/hooks/useActivities";
import { SCREEN_PADDING } from "../../shared/config/theme";
import { useActiveChild } from "../../shared/hooks/useActiveChild";
import { useThemedStyles } from "../../shared/lib/hooks/useTheme";
import Button from "../../shared/ui/Button";
import Card from "../../shared/ui/Card";
import {
  ChildSelector,
  QuickActions,
  RecentActivities,
  TodaySummary,
} from "../../widgets";

export default function HomeScreen() {
  const router = useRouter();

  // Active child 관리
  const {
    activeChildId,
    activeChild,
    isLoading: isActiveChildLoading,
    refetchChildren,
  } = useActiveChild();

  // 오늘의 활동 데이터
  const {
    data: todayData,
    isLoading: isTodayLoading,
    refetch: refetchToday,
  } = useTodayActivities(activeChildId);

  // 최근 활동 데이터
  const {
    data: recentData,
    isLoading: isRecentLoading,
    refetch: refetchRecent,
  } = useRecentActivities(activeChildId);

  const isLoading = isActiveChildLoading || isTodayLoading || isRecentLoading;

  const handleRefresh = async () => {
    try {
      await Promise.all([refetchChildren(), refetchToday(), refetchRecent()]);
    } catch {
      Alert.alert("오류", "데이터를 새로고침하는 중 오류가 발생했습니다.");
    }
  };

  const handleNavigateToRecord = () => {
    router.push("/(tabs)/record");
  };

  const handleNavigateToActivity = (activity: ActivityApi) => {
    router.push(`/activities/${activity.id}`);
  };

  const styles = useThemedStyles((theme) => ({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContainer: {
      flexGrow: 1,
      padding: SCREEN_PADDING,
    },
    header: {
      marginBottom: theme.spacing.lg,
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
    section: {
      marginBottom: theme.spacing.xl,
    },
    emptyState: {
      alignItems: "center" as const,
      justifyContent: "center" as const,
      padding: theme.spacing.xl,
    },
    emptyText: {
      fontSize: theme.typography.body1.fontSize,
      color: theme.colors.textSecondary,
      textAlign: "center" as const,
      marginBottom: theme.spacing.lg,
    },
  }));

  // 활성 아이가 없는 경우
  if (!activeChildId || !activeChild) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>다온에 오신 것을 환영합니다</Text>
            <Text style={styles.subtitle}>
              아이의 성장을 기록하기 위해 먼저 아이를 등록해주세요
            </Text>
          </View>

          <Card>
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                아직 등록된 아이가 없습니다.{"\n"}첫 번째 아이를 등록해보세요!
              </Text>
              <Button
                title="아이 등록하기"
                onPress={() => router.push("/children/create")}
                variant="primary"
              />
            </View>
          </Card>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* 아이 선택기 */}
        <View style={styles.section}>
          <ChildSelector
            onChildChange={() => {
              refetchToday();
              refetchRecent();
            }}
          />
        </View>

        {/* 빠른 기록 */}
        <View style={styles.section}>
          <QuickActions
            activeChildId={activeChildId}
            onActivityComplete={() => {
              refetchToday();
              refetchRecent();
            }}
          />
        </View>

        {/* 오늘의 요약 */}
        <View style={styles.section}>
          <TodaySummary todayActivities={todayData?.activities || []} />
        </View>

        {/* 최근 활동 */}
        <View style={styles.section}>
          <RecentActivities
            activities={recentData?.activities || []}
            onActivityPress={handleNavigateToActivity}
            onViewAllPress={handleNavigateToRecord}
            onFirstActivityPress={handleNavigateToRecord}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
