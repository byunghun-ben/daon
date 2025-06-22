import { ActivityFilters, type ActivityApi as Activity } from "@daon/shared";
import React, { useCallback, useState } from "react";
import {
  Alert,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useActivities } from "../../shared/api/hooks/useActivities";
import { useChildren } from "../../shared/api/hooks/useChildren";
import { SCREEN_PADDING } from "../../shared/config/theme";
import { useThemedStyles } from "../../shared/lib/hooks/useTheme";
import Button from "../../shared/ui/Button";
import Card from "../../shared/ui/Card";

interface ActivityListScreenProps {
  navigation: any;
  route?: {
    params?: {
      childId?: string;
    };
  };
}

const ACTIVITY_LABELS = {
  feeding: "수유",
  diaper: "기저귀",
  sleep: "수면",
  tummy_time: "배 뒤집기",
  custom: "기타",
} as const;

const ACTIVITY_ICONS = {
  feeding: "🍼",
  diaper: "👶",
  sleep: "😴",
  tummy_time: "🤸",
  custom: "📝",
} as const;

export default function ActivityListScreen({
  navigation,
  route,
}: ActivityListScreenProps) {
  const { childId: initialChildId } = route?.params || {};

  // React Query hooks
  const {
    data: childrenData,
    isLoading: childrenLoading,
    refetch: refetchChildren,
  } = useChildren();
  const children = childrenData?.children || [];

  const [selectedChild, setSelectedChild] = useState<string>(
    initialChildId || ""
  );
  const currentChildId = selectedChild || children[0]?.id;

  const [filters, setFilters] = useState<ActivityFilters>({
    childId: currentChildId || "",
    limit: 50,
    offset: 0,
  });

  const {
    data: activitiesData,
    isLoading: activitiesLoading,
    refetch: refetchActivities,
  } = useActivities(filters);

  const activities = activitiesData?.activities || [];
  const isLoading = childrenLoading || activitiesLoading;
  const [refreshing, setRefreshing] = useState(false);

  const styles = useThemedStyles((theme) => ({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      padding: SCREEN_PADDING,
    },
    header: {
      alignItems: "center" as const,
      marginBottom: theme.spacing.xl,
    },
    title: {
      fontSize: theme.typography.title.fontSize,
      fontWeight: theme.typography.title.fontWeight,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.sm,
    },
    subtitle: {
      fontSize: theme.typography.subtitle.fontSize,
      color: theme.colors.text.secondary,
      textAlign: "center" as const,
    },
    childSelector: {
      flexDirection: "row" as const,
      flexWrap: "wrap" as const,
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.xl,
    },
    childButton: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    childButtonSelected: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    childButtonText: {
      fontSize: theme.typography.body2.fontSize,
      color: theme.colors.text.primary,
    },
    childButtonTextSelected: {
      color: theme.colors.surface,
    },
    activityCard: {
      marginBottom: theme.spacing.md,
    },
    activityHeader: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      marginBottom: theme.spacing.sm,
    },
    activityIcon: {
      fontSize: 24,
      marginRight: theme.spacing.sm,
    },
    activityTitle: {
      fontSize: 16,
      fontWeight: "600" as const,
      color: theme.colors.text.primary,
      flex: 1,
    },
    activityTime: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.text.secondary,
    },
    activityDetails: {
      marginTop: theme.spacing.sm,
    },
    activityDetailRow: {
      flexDirection: "row" as const,
      justifyContent: "space-between" as const,
      marginBottom: theme.spacing.xs,
    },
    activityDetailLabel: {
      fontSize: theme.typography.body2.fontSize,
      color: theme.colors.text.secondary,
    },
    activityDetailValue: {
      fontSize: theme.typography.body2.fontSize,
      color: theme.colors.text.primary,
      fontWeight: "500" as const,
    },
    activityNotes: {
      fontSize: theme.typography.body2.fontSize,
      color: theme.colors.text.secondary,
      fontStyle: "italic" as const,
      marginTop: theme.spacing.xs,
    },
    emptyContainer: {
      alignItems: "center" as const,
      paddingVertical: theme.spacing.xxl * 2,
    },
    emptyText: {
      fontSize: theme.typography.body1.fontSize,
      color: theme.colors.text.muted,
      textAlign: "center" as const,
      marginBottom: theme.spacing.xl,
    },
    fab: {
      position: "absolute" as const,
      bottom: theme.spacing.xl,
      right: theme.spacing.xl,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.colors.primary,
      justifyContent: "center" as const,
      alignItems: "center" as const,
      ...theme.shadows.lg,
    },
    fabText: {
      fontSize: 24,
      color: theme.colors.surface,
    },
  }));

  // Auto-select first child if none selected
  React.useEffect(() => {
    if (!selectedChild && children.length > 0) {
      setSelectedChild(children[0].id);
    }
  }, [children, selectedChild]);

  // Update filters when child selection changes
  React.useEffect(() => {
    if (currentChildId) {
      setFilters((prev) => ({
        ...prev,
        childId: currentChildId,
      }));
    }
  }, [currentChildId]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchChildren(), refetchActivities()]);
    } catch (error) {
      Alert.alert("오류", "데이터를 새로고침하는데 실패했습니다.");
    } finally {
      setRefreshing(false);
    }
  }, [refetchChildren, refetchActivities]);

  const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString("ko-KR", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = (startedAt: string, endedAt?: string): string => {
    if (!endedAt) return "";

    const start = new Date(startedAt);
    const end = new Date(endedAt);
    const diffMinutes = Math.floor(
      (end.getTime() - start.getTime()) / (1000 * 60)
    );

    if (diffMinutes < 60) {
      return `${diffMinutes}분`;
    } else {
      const hours = Math.floor(diffMinutes / 60);
      const minutes = diffMinutes % 60;
      return minutes > 0 ? `${hours}시간 ${minutes}분` : `${hours}시간`;
    }
  };

  const renderActivityDetails = (activity: Activity) => {
    const details = [];

    // 수면 활동에서 종료시간이 있을 경우 소요시간 표시
    if (
      activity.type === "sleep" &&
      typeof activity.data === "object" &&
      activity.data &&
      "endedAt" in activity.data
    ) {
      details.push({
        label: "소요시간",
        value: formatDuration(
          activity.timestamp,
          activity.data.endedAt as string
        ),
      });
    }

    // Activity-specific metadata
    switch (activity.type) {
      case "feeding":
        if (
          typeof activity.data === "object" &&
          activity.data &&
          "amount" in activity.data &&
          activity.data.amount
        ) {
          details.push({ label: "수유량", value: `${activity.data.amount}ml` });
        }
        if (
          typeof activity.data === "object" &&
          activity.data &&
          "type" in activity.data &&
          activity.data.type
        ) {
          details.push({ label: "종류", value: activity.data.type as string });
        }
        break;

      case "diaper":
        if (
          typeof activity.data === "object" &&
          activity.data &&
          "type" in activity.data &&
          activity.data.type
        ) {
          details.push({ label: "상태", value: activity.data.type as string });
        }
        break;

      case "sleep":
        if (
          typeof activity.data === "object" &&
          activity.data &&
          "quality" in activity.data
        ) {
          details.push({
            label: "수면 품질",
            value: activity.data.quality as string,
          });
        }
        break;
    }

    return details;
  };

  const renderActivityCard = (activity: Activity) => {
    const details = renderActivityDetails(activity);

    return (
      <Card key={activity.id} style={styles.activityCard}>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("ActivityDetail", { activityId: activity.id })
          }
        >
          <View style={styles.activityHeader}>
            <Text style={styles.activityIcon}>
              {ACTIVITY_ICONS[activity.type as keyof typeof ACTIVITY_ICONS]}
            </Text>
            <Text style={styles.activityTitle}>
              {ACTIVITY_LABELS[activity.type as keyof typeof ACTIVITY_LABELS]}
            </Text>
            <Text style={styles.activityTime}>
              {formatDateTime(activity.timestamp)}
            </Text>
          </View>

          {details.length > 0 && (
            <View style={styles.activityDetails}>
              {details.map((detail, index) => (
                <View key={index} style={styles.activityDetailRow}>
                  <Text style={styles.activityDetailLabel}>{detail.label}</Text>
                  <Text style={styles.activityDetailValue}>{detail.value}</Text>
                </View>
              ))}
            </View>
          )}

          {activity.notes && (
            <Text style={styles.activityNotes}>"{activity.notes}"</Text>
          )}
        </TouchableOpacity>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>활동 기록</Text>
          <Text style={styles.subtitle}>아이의 일상 활동을 확인하세요</Text>
        </View>

        {/* Child Selection */}
        {children.length > 1 && (
          <View style={styles.childSelector}>
            {children.map((child) => (
              <TouchableOpacity
                key={child.id}
                style={[
                  styles.childButton,
                  currentChildId === child.id && styles.childButtonSelected,
                ]}
                onPress={() => setSelectedChild(child.id)}
              >
                <Text
                  style={[
                    styles.childButtonText,
                    currentChildId === child.id &&
                      styles.childButtonTextSelected,
                  ]}
                >
                  {child.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Activities List */}
        {isLoading ? (
          <Text style={styles.emptyText}>로딩 중...</Text>
        ) : activities.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              아직 기록된 활동이 없습니다.{"\n"}첫 번째 활동을 기록해보세요!
            </Text>
            <Button
              title="첫 활동 기록하기"
              onPress={() =>
                navigation.navigate("RecordActivity", {
                  childId: currentChildId,
                })
              }
            />
          </View>
        ) : (
          activities.map(renderActivityCard)
        )}
      </ScrollView>

      {/* Floating Action Button */}
      {currentChildId && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() =>
            navigation.navigate("RecordActivity", { childId: currentChildId })
          }
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}
