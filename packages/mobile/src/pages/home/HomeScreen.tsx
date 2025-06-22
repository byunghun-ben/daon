import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useThemedStyles } from "../../shared/lib/hooks/useTheme";
import { SCREEN_PADDING } from "../../shared/config/theme";
import Card from "../../shared/ui/Card";
import Button from "../../shared/ui/Button";
import { useChildren } from "../../shared/api/hooks/useChildren";
import {
  useTodayActivities,
  useRecentActivities,
} from "../../shared/api/hooks/useActivities";

interface HomeScreenProps {
  navigation: any; // Replace with proper navigation type
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);

  // API 호출
  const {
    data: childrenData,
    isLoading: childrenLoading,
    error: childrenError,
    refetch: refetchChildren,
  } = useChildren();

  const children = childrenData?.children || [];
  const currentChildId = selectedChildId || children[0]?.id;

  const {
    data: todayData,
    isLoading: todayLoading,
    refetch: refetchToday,
  } = useTodayActivities(currentChildId || "");

  const {
    data: recentData,
    isLoading: recentLoading,
    refetch: refetchRecent,
  } = useRecentActivities(currentChildId || "", 5);

  const todayActivities = todayData?.activities || [];
  const recentActivities = recentData?.activities || [];

  const isLoading = childrenLoading || todayLoading || recentLoading;
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

  // 오늘 활동 요약 계산
  const getTodaySummary = () => {
    const summary = {
      feeding: 0,
      diaper: 0,
      sleep: 0,
      tummy_time: 0,
    };

    todayActivities.forEach((activity) => {
      if (activity.type in summary) {
        summary[activity.type as keyof typeof summary]++;
      }
    });

    return summary;
  };

  const summary = getTodaySummary();

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatActivityType = (type: string) => {
    const typeMap = {
      feeding: "수유",
      diaper: "기저귀",
      sleep: "수면",
      tummy_time: "배밀이",
      custom: "사용자 정의",
    };
    return typeMap[type as keyof typeof typeMap] || type;
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

  if (childrenError) {
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>다온</Text>
          <Text style={styles.subtitle}>
            {children.length > 0 ? "오늘의 활동" : "아이를 추가해주세요"}
          </Text>
        </View>

        <View style={styles.content}>
          {/* Child Selector */}
          {children.length > 1 && (
            <View style={styles.childSelector}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {children.map((child) => (
                  <Button
                    key={child.id}
                    title={child.name}
                    variant={
                      currentChildId === child.id ? "primary" : "outline"
                    }
                    size="small"
                    onPress={() => setSelectedChildId(child.id)}
                  />
                ))}
              </ScrollView>
            </View>
          )}

          {children.length === 0 ? (
            <Card>
              <Text style={styles.emptyText}>
                아직 등록된 아이가 없습니다.{"\n"}
                아이를 먼저 등록해주세요.
              </Text>
              <Button
                title="아이 등록하기"
                onPress={() => navigation.navigate("Children")}
              />
            </Card>
          ) : (
            <>
              {/* Quick Actions */}
              <View style={styles.quickActions}>
                <Button
                  title="수유 기록"
                  size="small"
                  buttonStyle={styles.actionButton}
                  onPress={() =>
                    navigation.navigate("RecordActivity", {
                      activityType: "feeding",
                      childId: currentChildId,
                    })
                  }
                />
                <Button
                  title="기저귀 교체"
                  size="small"
                  variant="secondary"
                  buttonStyle={styles.actionButton}
                  onPress={() =>
                    navigation.navigate("RecordActivity", {
                      activityType: "diaper",
                      childId: currentChildId,
                    })
                  }
                />
                <Button
                  title="수면 기록"
                  size="small"
                  variant="outline"
                  buttonStyle={styles.actionButton}
                  onPress={() =>
                    navigation.navigate("RecordActivity", {
                      activityType: "sleep",
                      childId: currentChildId,
                    })
                  }
                />
              </View>

              {/* Today Summary */}
              <Card style={{ marginBottom: styles.content.padding }}>
                <Text style={styles.cardTitle}>오늘 요약</Text>
                <View style={styles.summaryGrid}>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryValue}>{summary.feeding}</Text>
                    <Text style={styles.summaryLabel}>수유</Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryValue}>{summary.diaper}</Text>
                    <Text style={styles.summaryLabel}>기저귀</Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryValue}>{summary.sleep}</Text>
                    <Text style={styles.summaryLabel}>수면</Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryValue}>
                      {summary.tummy_time}
                    </Text>
                    <Text style={styles.summaryLabel}>배밀이</Text>
                  </View>
                </View>
              </Card>

              {/* Recent Activities */}
              <Card>
                <Text style={styles.sectionTitle}>최근 활동</Text>
                {recentActivities.length === 0 ? (
                  <>
                    <Text style={styles.emptyText}>
                      아직 기록된 활동이 없습니다.
                    </Text>
                    <Button
                      title="첫 활동 기록하기"
                      variant="outline"
                      onPress={() =>
                        navigation.navigate("Record", {
                          childId: currentChildId,
                        })
                      }
                    />
                  </>
                ) : (
                  <>
                    {recentActivities.map((activity) => (
                      <TouchableOpacity
                        key={activity.id}
                        style={styles.activityItem}
                        onPress={() =>
                          navigation.navigate("RecordActivity", {
                            activityId: activity.id,
                            childId: currentChildId,
                            isEditing: true,
                          })
                        }
                      >
                        <View style={styles.activityHeader}>
                          <Text style={styles.activityType}>
                            {formatActivityType(activity.type)}
                          </Text>
                          <Text style={styles.activityTime}>
                            {formatTime(activity.started_at)}
                          </Text>
                        </View>
                        {activity.notes && (
                          <Text style={styles.activityNotes} numberOfLines={2}>
                            {activity.notes}
                          </Text>
                        )}
                      </TouchableOpacity>
                    ))}
                    <Button
                      title="모든 활동 보기"
                      variant="outline"
                      onPress={() =>
                        navigation.navigate("ActivityList", {
                          childId: currentChildId,
                        })
                      }
                    />
                  </>
                )}
              </Card>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
