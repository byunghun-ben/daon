import React from "react";
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
import { HomeScreenProps } from "../../shared/types/navigation";
import Button from "../../shared/ui/Button";
import Card from "../../shared/ui/Card";
import {
  ChildSelector,
  QuickActions,
  TodaySummary,
  RecentActivities,
} from "../../widgets";
import type { ActivityApi } from "@daon/shared";

export default function HomeScreen({ navigation }: HomeScreenProps) {
  // Active child 관리
  const {
    activeChildId,
    activeChild,
    isLoading: isLoadingActiveChild,
    error: activeChildError,
    refetchChildren,
  } = useActiveChild();

  const {
    data: todayData,
    isLoading: todayLoading,
    refetch: refetchToday,
  } = useTodayActivities(activeChildId);

  const {
    data: recentData,
    isLoading: recentLoading,
    refetch: refetchRecent,
  } = useRecentActivities(activeChildId, 5);

  const todayActivities = todayData?.activities || [];
  const recentActivities = recentData?.activities || [];

  const isLoading = isLoadingActiveChild || todayLoading || recentLoading;
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchChildren(), refetchToday(), refetchRecent()]);
    } catch (error) {
      Alert.alert("오류", "데이터를 새로고침하는데 실패했습니다.");
    } finally {
      setRefreshing(false);
    }
  }, [refetchChildren, refetchToday, refetchRecent]);

  // 핸들러 함수들

  const handleActivityPress = (activity: ActivityApi) => {
    if (!activeChildId) return;
    navigation.navigate("RecordActivity", {
      activityType: activity.type,
      activityId: activity.id,
      childId: activeChildId,
      isEditing: true,
    });
  };

  const handleViewAllActivities = () => {
    if (!activeChildId) return;
    navigation.navigate("ActivityList", {
      childId: activeChildId,
    });
  };

  const handleFirstActivityPress = () => {
    if (!activeChildId) return;
    navigation.navigate("RecordActivity", {
      activityType: "feeding",
      childId: activeChildId,
    });
  };

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
    emptyContainer: {
      flex: 1,
      justifyContent: "center" as const,
      alignItems: "center" as const,
      padding: SCREEN_PADDING,
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
    childSelector: {
      marginBottom: theme.spacing.lg,
    },
    activityItem: {
      padding: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    activityHeader: {
      flexDirection: "row" as const,
      justifyContent: "space-between" as const,
      alignItems: "center" as const,
      marginBottom: theme.spacing.xs,
    },
    activityType: {
      fontSize: theme.typography.body1.fontSize,
      fontWeight: "600" as const,
      color: theme.colors.text.primary,
    },
    activityTime: {
      fontSize: theme.typography.body2.fontSize,
      color: theme.colors.text.secondary,
    },
    activityNotes: {
      fontSize: theme.typography.body2.fontSize,
      color: theme.colors.text.muted,
      marginTop: theme.spacing.xs,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center" as const,
      alignItems: "center" as const,
    },
    summaryGrid: {
      flexDirection: "row" as const,
      justifyContent: "space-between" as const,
    },
    summaryItem: {
      alignItems: "center" as const,
      flex: 1,
    },
    summaryValue: {
      fontSize: 24,
      fontWeight: "700" as const,
      color: theme.colors.primary,
      marginBottom: theme.spacing.xs,
    },
    summaryLabel: {
      fontSize: theme.typography.body2.fontSize,
      color: theme.colors.text.secondary,
    },
  }));

  if (activeChildError) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            데이터를 불러오는데 실패했습니다.
          </Text>
          <Button title="다시 시도" onPress={() => refetchChildren()} />
        </View>
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.emptyText}>로딩 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // 활성화된 아이가 없는 경우 (엣지케이스)
  if (!activeChildId || !activeChild) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>다온</Text>
          <Text style={styles.subtitle}>아이를 추가해주세요</Text>
        </View>
        <View style={styles.content}>
          <Card>
            <Text style={styles.emptyText}>
              아직 등록된 아이가 없습니다.{"\n"}
              아이를 먼저 등록해주세요.
            </Text>
            <Button
              title="아이 등록하기"
              onPress={() => navigation.navigate("ChildrenList")}
            />
          </Card>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>다온</Text>
              <Text style={styles.subtitle}>오늘의 활동</Text>
            </View>
            {/* Child Selector in Header */}
            <ChildSelector
              onChildChange={() => {
                // 아이가 변경되면 데이터 새로고침
                refetchToday();
                refetchRecent();
              }}
            />
          </View>
        </View>

        <View style={styles.content}>
          {/* Quick Actions */}
          <QuickActions
            activeChildId={activeChildId}
            onActivityComplete={() => {
              // Refresh data when activity is completed
              refetchToday();
              refetchRecent();
            }}
          />

          {/* Today Summary */}
          <TodaySummary todayActivities={todayActivities} />

          {/* Recent Activities */}
          <RecentActivities
            activities={recentActivities}
            onActivityPress={handleActivityPress}
            onViewAllPress={handleViewAllActivities}
            onFirstActivityPress={handleFirstActivityPress}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
