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
import { SCREEN_PADDING } from "../../shared/config/theme";
import Button from "../../shared/ui/Button";
import Card from "../../shared/ui/Card";
import { 
  diaryApi, 
  type DiaryEntry,
  type DiaryFilters 
} from "../../shared/api/diary";
import { childrenApi, type Child } from "../../shared/api/children";

interface DiaryListScreenProps {
  navigation: any;
  route?: {
    params?: {
      childId?: string;
    };
  };
}

export default function DiaryListScreen({ navigation, route }: DiaryListScreenProps) {
  const { childId: initialChildId } = route?.params || {};
  
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<string>(initialChildId || "");
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);
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
    diaryCard: {
      marginBottom: theme.spacing.lg,
    },
    diaryHeader: {
      flexDirection: "row" as const,
      justifyContent: "space-between" as const,
      alignItems: "center" as const,
      marginBottom: theme.spacing.sm,
    },
    diaryDate: {
      fontSize: theme.typography.body1.fontSize,
      fontWeight: "600" as const,
      color: theme.colors.text.primary,
    },
    diaryActions: {
      flexDirection: "row" as const,
      gap: theme.spacing.xs,
    },
    actionButton: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
    },
    actionButtonText: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.primary,
    },
    diaryPreview: {
      fontSize: theme.typography.body2.fontSize,
      color: theme.colors.text.secondary,
      lineHeight: 20,
      marginBottom: theme.spacing.sm,
    },
    diaryMeta: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      gap: theme.spacing.md,
    },
    metaItem: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      gap: theme.spacing.xs,
    },
    metaText: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.text.muted,
    },
    milestoneTag: {
      backgroundColor: theme.colors.info + "20",
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.sm,
      marginTop: theme.spacing.xs,
    },
    milestoneText: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.info,
      fontWeight: "500" as const,
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
      loadDiaryEntries();
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

  const loadDiaryEntries = async () => {
    if (!selectedChild) return;
    
    try {
      const filters: DiaryFilters = {
        childId: selectedChild,
        limit: 50,
        offset: 0,
      };
      
      const response = await diaryApi.getDiaryEntries(filters);
      setDiaryEntries(response.diaryEntries);
    } catch (error: any) {
      Alert.alert("오류", "일기 목록을 불러오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadDiaryEntries();
  }, [selectedChild]);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "short",
    });
  };

  const getPreviewText = (content: string): string => {
    return content.length > 150 ? content.substring(0, 150) + "..." : content;
  };

  const handleEditDiary = (diary: DiaryEntry) => {
    navigation.navigate("WriteDiary", {
      diaryId: diary.id,
      childId: diary.childId,
      isEditing: true,
    });
  };

  const handleDeleteDiary = (diary: DiaryEntry) => {
    Alert.alert(
      "일기 삭제",
      "정말로 이 일기를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.",
      [
        { text: "취소", style: "cancel" },
        {
          text: "삭제",
          style: "destructive",
          onPress: async () => {
            try {
              await diaryApi.deleteDiaryEntry(diary.id);
              Alert.alert("삭제 완료", "일기가 삭제되었습니다.");
              loadDiaryEntries();
            } catch (error: any) {
              Alert.alert("오류", "삭제 중 오류가 발생했습니다.");
            }
          },
        },
      ]
    );
  };

  const renderDiaryCard = (diary: DiaryEntry) => (
    <Card key={diary.id} style={styles.diaryCard}>
      <TouchableOpacity
        onPress={() => navigation.navigate("DiaryDetail", { diaryId: diary.id })}
      >
        <View style={styles.diaryHeader}>
          <Text style={styles.diaryDate}>
            {formatDate(diary.date)}
          </Text>
          <View style={styles.diaryActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleEditDiary(diary)}
            >
              <Text style={styles.actionButtonText}>수정</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleDeleteDiary(diary)}
            >
              <Text style={[styles.actionButtonText, { color: styles.container.backgroundColor }]}>
                삭제
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <Text style={styles.diaryPreview}>
          {getPreviewText(diary.content)}
        </Text>
        
        <View style={styles.diaryMeta}>
          {diary.photos && diary.photos.length > 0 && (
            <View style={styles.metaItem}>
              <Text style={styles.metaText}>📷 {diary.photos.length}</Text>
            </View>
          )}
          
          {diary.videos && diary.videos.length > 0 && (
            <View style={styles.metaItem}>
              <Text style={styles.metaText}>🎥 {diary.videos.length}</Text>
            </View>
          )}
          
          <View style={styles.metaItem}>
            <Text style={styles.metaText}>
              {new Date(diary.createdAt).toLocaleDateString("ko-KR")} 작성
            </Text>
          </View>
        </View>
        
        {diary.milestones && diary.milestones.length > 0 && (
          <View style={styles.milestoneTag}>
            <Text style={styles.milestoneText}>
              🎉 마일스톤 {diary.milestones.length}개
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>육아 일기</Text>
          <Text style={styles.subtitle}>
            소중한 순간들을 기록하고 추억을 만들어보세요
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

        {/* Diary Entries List */}
        {isLoading ? (
          <Text style={styles.emptyText}>로딩 중...</Text>
        ) : diaryEntries.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              아직 작성된 일기가 없습니다.{"\n"}
              첫 번째 일기를 써보세요!
            </Text>
            <Button
              title="첫 일기 쓰기"
              onPress={() => navigation.navigate("WriteDiary", { childId: selectedChild })}
            />
          </View>
        ) : (
          diaryEntries.map(renderDiaryCard)
        )}
      </ScrollView>

      {/* Floating Action Button */}
      {selectedChild && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate("WriteDiary", { childId: selectedChild })}
        >
          <Text style={styles.fabText}>✏️</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}