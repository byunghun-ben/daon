import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { useThemedStyles } from '../../shared/lib/hooks/useTheme';
import { SCREEN_PADDING } from '../../shared/config/theme';
import Button from '../../shared/ui/Button';
import Card from '../../shared/ui/Card';
import { activitiesApi, type Activity } from '../../shared/api/activities';
import { childrenApi, type Child } from '../../shared/api/children';

interface RecordScreenProps {
  navigation: any;
  route?: {
    params?: {
      childId?: string;
    };
  };
}

export default function RecordScreen({ navigation, route }: RecordScreenProps) {
  const { childId } = route?.params || {};
  const [activities, setActivities] = useState<Activity[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(childId || null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const recordTypes = [
    { id: 'feeding', title: '수유', icon: '🍼', color: 'primary' },
    { id: 'diaper', title: '기저귀', icon: '👶', color: 'secondary' },
    { id: 'sleep', title: '수면', icon: '😴', color: 'tertiary' },
    { id: 'tummy_time', title: '배밀이', icon: '🤱', color: 'quaternary' },
  ] as const;

  const styles = useThemedStyles((theme) => ({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      alignItems: "center" as const,
      marginBottom: theme.spacing.xl,
      paddingHorizontal: SCREEN_PADDING,
      paddingTop: theme.spacing.lg,
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
    content: {
      flex: 1,
      paddingHorizontal: SCREEN_PADDING,
    },
    childSelector: {
      marginBottom: theme.spacing.xl,
    },
    grid: {
      flexDirection: "row" as const,
      flexWrap: "wrap" as const,
      justifyContent: "space-between" as const,
      marginBottom: theme.spacing.xl,
    },
    recordButton: {
      width: "48%",
      marginBottom: theme.spacing.md,
    },
    recordCard: {
      padding: theme.spacing.lg,
      alignItems: "center" as const,
      justifyContent: "center" as const,
      minHeight: 120,
    },
    recordIcon: {
      fontSize: 32,
      marginBottom: theme.spacing.sm,
    },
    recordTitle: {
      fontSize: theme.typography.body1.fontSize,
      fontWeight: "600" as const,
      color: theme.colors.text.primary,
    },
    recentSection: {
      marginBottom: theme.spacing.xl,
    },
    sectionTitle: {
      fontSize: theme.typography.h3.fontSize,
      fontWeight: theme.typography.h3.fontWeight,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.md,
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
    emptyContainer: {
      alignItems: "center" as const,
      paddingVertical: theme.spacing.xxl,
    },
    emptyText: {
      fontSize: theme.typography.body1.fontSize,
      color: theme.colors.text.muted,
      textAlign: "center" as const,
      marginBottom: theme.spacing.lg,
    },
  }));

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedChildId) {
      loadActivities();
    }
  }, [selectedChildId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([loadChildren(), loadActivities()]);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadChildren = async () => {
    try {
      const response = await childrenApi.getChildren();
      setChildren(response.children);
      if (!selectedChildId && response.children.length > 0) {
        setSelectedChildId(response.children[0].id);
      }
    } catch (error) {
      Alert.alert("오류", "아이 목록을 불러오는데 실패했습니다.");
    }
  };

  const loadActivities = async () => {
    if (!selectedChildId) return;
    
    try {
      const response = await activitiesApi.getActivities({
        child_id: selectedChildId,
        limit: 10,
      });
      setActivities(response.activities);
    } catch (error) {
      Alert.alert("오류", "활동 기록을 불러오는데 실패했습니다.");
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData().finally(() => setRefreshing(false));
  }, [selectedChildId]);

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

  const handleRecordType = (type: string) => {
    if (!selectedChildId) {
      Alert.alert("알림", "먼저 아이를 선택해주세요.");
      return;
    }
    navigation.navigate("RecordActivity", { 
      activityType: type, 
      childId: selectedChildId 
    });
  };

  const renderActivityItem = (activity: Activity) => (
    <TouchableOpacity
      key={activity.id}
      style={styles.activityItem}
      onPress={() => navigation.navigate("RecordActivity", {
        activityId: activity.id,
        childId: selectedChildId,
        isEditing: true,
      })}
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
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>로딩 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
            {selectedChildId ? "아이의 일상 활동을 기록하세요" : "아이를 선택해주세요"}
          </Text>
        </View>

        {children.length > 1 && (
          <View style={styles.childSelector}>
            <Text style={styles.sectionTitle}>아이 선택</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {children.map((child) => (
                <Button
                  key={child.id}
                  title={child.name}
                  variant={selectedChildId === child.id ? "primary" : "outline"}
                  size="small"
                  onPress={() => setSelectedChildId(child.id)}
                />
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.grid}>
          {recordTypes.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={styles.recordButton}
              onPress={() => handleRecordType(type.id)}
            >
              <Card style={styles.recordCard}>
                <Text style={styles.recordIcon}>{type.icon}</Text>
                <Text style={styles.recordTitle}>{type.title}</Text>
              </Card>
            </TouchableOpacity>
          ))}
        </View>
        
        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>최근 기록</Text>
          {activities.length === 0 ? (
            <Card>
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  아직 기록된 활동이 없습니다.{"\n"}
                  위의 버튼을 눌러 첫 활동을 기록해보세요!
                </Text>
              </View>
            </Card>
          ) : (
            <Card>
              {activities.map(renderActivityItem)}
            </Card>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

