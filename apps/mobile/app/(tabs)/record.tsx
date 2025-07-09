import { type ActivityApi as Activity } from "@daon/shared";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ActivityCard } from "../../entities";
import { useRecentActivities } from "../../shared/api/hooks/useActivities";
import { useActiveChild } from "../../shared/hooks/useActiveChild";
import Button from "../../shared/ui/Button";
import Card from "../../shared/ui/Card";

export default function RecordScreen() {
  const router = useRouter();
  const { activeChild } = useActiveChild();

  const { data: recentActivities = [], refetch } = useRecentActivities(
    activeChild?.id || null,
  );

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch {
      Alert.alert("오류", "데이터를 새로고침하는 중 오류가 발생했습니다.");
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const handleNewRecord = () => {
    router.push("/record/new");
  };

  const handleActivityPress = (activity: Activity) => {
    router.push(`/activities/${activity.id}`);
  };

  // const styles = useThemedStyles((theme) => ({
  //   container: {
  //     flex: 1,
  //     backgroundColor: theme.colors.background,
  //   },
  //   header: {
  //     padding: SCREEN_PADDING,
  //     paddingBottom: theme.spacing.md,
  //   },
  //   title: {
  //     fontSize: theme.typography.title.fontSize,
  //     fontWeight: theme.typography.title.fontWeight,
  //     color: theme.colors.text,
  //     marginBottom: theme.spacing.sm,
  //   },
  //   subtitle: {
  //     fontSize: theme.typography.body2.fontSize,
  //     color: theme.colors.textSecondary,
  //   },
  //   content: {
  //     flex: 1,
  //     padding: SCREEN_PADDING,
  //   },
  //   quickActions: {
  //     marginBottom: theme.spacing.xl,
  //   },
  //   activityGrid: {
  //     flexDirection: "row" as const,
  //     flexWrap: "wrap" as const,
  //     gap: theme.spacing.md,
  //     marginBottom: theme.spacing.xl,
  //   },
  //   activityButton: {
  //     flex: 1,
  //     minWidth: "45%" as const,
  //     padding: theme.spacing.lg,
  //     backgroundColor: theme.colors.surface,
  //     borderRadius: theme.borderRadius.md,
  //     alignItems: "center" as const,
  //     justifyContent: "center" as const,
  //     borderWidth: 1,
  //     borderColor: theme.colors.border,
  //   },
  //   activityButtonText: {
  //     fontSize: theme.typography.button.fontSize,
  //     fontWeight: theme.typography.button.fontWeight,
  //     color: theme.colors.text,
  //     marginTop: theme.spacing.sm,
  //   },
  //   activitiesSection: {
  //     flex: 1,
  //   },
  //   sectionTitle: {
  //     fontSize: theme.typography.subtitle.fontSize,
  //     fontWeight: theme.typography.subtitle.fontWeight,
  //     color: theme.colors.text,
  //     marginBottom: theme.spacing.md,
  //   },
  //   activityItem: {
  //     padding: theme.spacing.md,
  //     marginBottom: theme.spacing.sm,
  //   },
  //   activityHeader: {
  //     flexDirection: "row" as const,
  //     justifyContent: "space-between" as const,
  //     alignItems: "center" as const,
  //     marginBottom: theme.spacing.xs,
  //   },
  //   activityType: {
  //     fontSize: theme.typography.body1.fontSize,
  //     fontWeight: "600" as const,
  //     color: theme.colors.text,
  //   },
  //   activityTime: {
  //     fontSize: theme.typography.body2.fontSize,
  //     color: theme.colors.textSecondary,
  //   },
  //   activityDetails: {
  //     fontSize: theme.typography.body2.fontSize,
  //     color: theme.colors.textSecondary,
  //   },
  //   emptyState: {
  //     alignItems: "center" as const,
  //     justifyContent: "center" as const,
  //     padding: theme.spacing.xxl,
  //   },
  //   emptyText: {
  //     fontSize: theme.typography.body1.fontSize,
  //     color: theme.colors.textSecondary,
  //     textAlign: "center" as const,
  //     marginBottom: theme.spacing.lg,
  //   },
  // }));

  const activityTypes = [
    { key: "feeding", label: "수유", icon: "🍼" },
    { key: "diaper", label: "기저귀", icon: "👶" },
    { key: "sleep", label: "수면", icon: "😴" },
    { key: "tummy_time", label: "배밀이", icon: "🤸‍♀️" },
  ];

  if (!activeChild) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="mb-4">
          <Text className="text-2xl font-bold">활동 기록</Text>
          <Text className="text-sm text-text-secondary">
            아이를 먼저 등록해주세요
          </Text>
        </View>
        <View className="flex-1 px-4">
          <Card>
            <View className="items-center justify-center">
              <Text className="text-sm text-text-secondary">
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
    <SafeAreaView className="flex-1 bg-background">
      <View className="p-6">
        <Text className="text-2xl font-bold">활동 기록</Text>
        <Text className="text-sm text-text-secondary">
          {activeChild.name}의 일상을 기록해보세요
        </Text>
      </View>

      <ScrollView
        className="flex-1 p-6"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* 빠른 기록 */}
        <View className="mb-4">
          <Text className="text-xl font-bold">빠른 기록</Text>
          <View className="flex-row flex-wrap gap-4">
            {activityTypes.map((activity) => (
              <TouchableOpacity
                key={activity.key}
                className="flex-1 bg-surface rounded-lg p-4 items-center"
                onPress={() => router.push(`/record/new?type=${activity.key}`)}
              >
                <Text className="text-2xl">{activity.icon}</Text>
                <Text className="text-sm text-text-secondary">
                  {activity.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 최근 활동 */}
        <View className="mb-4">
          <Text className="text-lg font-bold">최근 활동</Text>
          {Array.isArray(recentActivities) && recentActivities.length === 0 ? (
            <Card>
              <View className="items-center justify-center">
                <Text className="text-sm text-text-secondary">
                  아직 기록된 활동이 없습니다.{"\n"}첫 번째 활동을 기록해보세요!
                </Text>
                <Button
                  title="활동 기록하기"
                  onPress={handleNewRecord}
                  variant="primary"
                />
              </View>
            </Card>
          ) : Array.isArray(recentActivities) ? (
            recentActivities.map((activity: Activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                onPress={handleActivityPress}
                showUser={false}
              />
            ))
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
