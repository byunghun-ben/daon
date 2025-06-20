import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from "react-native";
import { useThemedStyles } from "../../shared/lib/hooks/useTheme";
import { SCREEN_PADDING, COLORS } from "../../shared/config/theme";
import Button from "../../shared/ui/Button";
import Card from "../../shared/ui/Card";
import { 
  activitiesApi, 
  type Activity,
  type ActivityFilters 
} from "../../shared/api/activities";
import { childrenApi, type Child } from "../../shared/api/children";

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

export default function ActivityListScreen({ navigation, route }: ActivityListScreenProps) {
  const { childId: initialChildId } = route?.params || {};
  
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<string>(initialChildId || "");
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

  useEffect(() => {
    loadChildren();
  }, []);

  useEffect(() => {
    if (selectedChild) {
      loadActivities();
    }
  }, [selectedChild]);

  const loadChildren = async () => {
    try {
      const response = await childrenApi.getChildren();
      setChildren(response.children);
      
      // If no child is selected and there's only one child, select it automatically
      if (!selectedChild && response.children.length === 1) {
        setSelectedChild(response.children[0].id);
      }
    } catch (error: any) {
      Alert.alert("오류", "아이 목록을 불러오는데 실패했습니다.");
    }
  };

  const loadActivities = async () => {
    if (!selectedChild) return;
    
    try {
      const filters: ActivityFilters = {
        child_id: selectedChild,
        limit: 50,
        offset: 0,
      };
      
      const response = await activitiesApi.getActivities(filters);
      setActivities(response.activities);
    } catch (error: any) {
      Alert.alert("오류", "활동 목록을 불러오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadActivities();
  }, [selectedChild]);

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
    const diffMinutes = Math.floor((end.getTime() - start.getTime()) / (1000 * 60));
    
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
    
    if (activity.ended_at) {
      details.push({
        label: "소요시간",
        value: formatDuration(activity.started_at, activity.ended_at),
      });
    }

    // Activity-specific metadata
    switch (activity.type) {
      case "feeding":
        if (activity.metadata.amount) {
          details.push({ label: "수유량", value: `${activity.metadata.amount}ml` });
        }
        if (activity.metadata.type) {
          details.push({ label: "종류", value: activity.metadata.type });
        }
        break;
      
      case "diaper":
        if (activity.metadata.type) {
          details.push({ label: "상태", value: activity.metadata.type });
        }
        break;
      
      case "sleep":
        if (activity.metadata.quality) {
          details.push({ label: "수면 품질", value: activity.metadata.quality });
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
          onPress={() => navigation.navigate("ActivityDetail", { activityId: activity.id })}
        >
          <View style={styles.activityHeader}>
            <Text style={styles.activityIcon}>
              {ACTIVITY_ICONS[activity.type as keyof typeof ACTIVITY_ICONS]}
            </Text>
            <Text style={styles.activityTitle}>
              {ACTIVITY_LABELS[activity.type as keyof typeof ACTIVITY_LABELS]}
            </Text>
            <Text style={styles.activityTime}>
              {formatDateTime(activity.started_at)}
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
            <Text style={styles.activityNotes}>
              "{activity.notes}"
            </Text>
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
          <Text style={styles.subtitle}>
            아이의 일상 활동을 확인하세요
          </Text>
        </View>

        {/* Child Selection */}
        {children.length > 1 && (
          <View style={styles.childSelector}>
            {children.map((child) => (
              <TouchableOpacity
                key={child.id}
                style={[
                  styles.childButton,
                  selectedChild === child.id && styles.childButtonSelected,
                ]}
                onPress={() => setSelectedChild(child.id)}
              >
                <Text
                  style={[
                    styles.childButtonText,
                    selectedChild === child.id && styles.childButtonTextSelected,
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
              아직 기록된 활동이 없습니다.{"\n"}
              첫 번째 활동을 기록해보세요!
            </Text>
            <Button
              title="첫 활동 기록하기"
              onPress={() => navigation.navigate("RecordActivity", { childId: selectedChild })}
            />
          </View>
        ) : (
          activities.map(renderActivityCard)
        )}
      </ScrollView>

      {/* Floating Action Button */}
      {selectedChild && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate("RecordActivity", { childId: selectedChild })}
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}