import { type ChildApi as Child } from "@daon/shared";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { childrenApi } from "../../shared/api/children";
import { SCREEN_PADDING } from "../../shared/config/theme";
import { useThemedStyles } from "../../shared/lib/hooks/useTheme";
import Button from "../../shared/ui/Button";
import Card from "../../shared/ui/Card";
import { ChildrenListScreenProps } from "../../shared/types/navigation";

export default function ChildrenListScreen({
  navigation,
}: ChildrenListScreenProps) {
  const [children, setChildren] = useState<Child[]>([]);
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
      marginBottom: theme.spacing.xxl,
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
    childCard: {
      marginBottom: theme.spacing.lg,
    },
    childInfo: {
      flexDirection: "row" as const,
      justifyContent: "space-between" as const,
      alignItems: "center" as const,
    },
    childDetails: {
      flex: 1,
    },
    childName: {
      fontSize: 18,
      fontWeight: "600" as const,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.xs,
    },
    childMeta: {
      fontSize: theme.typography.body2.fontSize,
      color: theme.colors.text.secondary,
    },
    childActions: {
      flexDirection: "row" as const,
      marginTop: theme.spacing.md,
    },
    actionButton: {
      flex: 1,
      marginHorizontal: theme.spacing.xs,
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
    addButton: {
      marginTop: theme.spacing.xl,
    },
  }));

  useEffect(() => {
    loadChildren();
  }, []);

  const loadChildren = async () => {
    try {
      const response = await childrenApi.getChildren();
      setChildren(response.children);
    } catch (error: any) {
      Alert.alert("오류", "아이 목록을 불러오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadChildren();
  }, []);

  const calculateAge = (birthDate: string): string => {
    const birth = new Date(birthDate);
    const now = new Date();

    if (birth > now) {
      const diffTime = birth.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const diffWeeks = Math.floor(diffDays / 7);

      if (diffWeeks > 0) {
        return `출산까지 ${diffWeeks}주`;
      } else {
        return `출산까지 ${diffDays}일`;
      }
    } else {
      const diffTime = now.getTime() - birth.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const diffWeeks = Math.floor(diffDays / 7);
      const diffMonths = Math.floor(diffDays / 30);

      if (diffMonths > 0) {
        return `${diffMonths}개월`;
      } else if (diffWeeks > 0) {
        return `${diffWeeks}주`;
      } else {
        return `${diffDays}일`;
      }
    }
  };

  const formatGender = (gender?: string): string => {
    switch (gender) {
      case "male":
        return "남아";
      case "female":
        return "여아";
      case "other":
        return "기타";
      default:
        return "";
    }
  };

  const renderChildCard = (child: Child) => (
    <Card key={child.id} style={styles.childCard}>
      <TouchableOpacity
        onPress={() =>
          navigation.navigate("ChildProfile", {
            childId: child.id,
            isEditing: true,
          })
        }
      >
        <View style={styles.childInfo}>
          <View style={styles.childDetails}>
            <Text style={styles.childName}>{child.name}</Text>
            <Text style={styles.childMeta}>
              {calculateAge(child.birthDate)}
              {child.gender && ` · ${formatGender(child.gender)}`}
            </Text>
            <Text style={styles.childMeta}>
              생일: {new Date(child.birthDate).toLocaleDateString("ko-KR")}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      <View style={styles.childActions}>
        <Button
          title="활동 기록"
          size="small"
          buttonStyle={styles.actionButton}
          onPress={() =>
            navigation.navigate("RecordActivity", {
              activityType: "feeding",
              childId: child.id,
            })
          }
        />
        <Button
          title="일기 쓰기"
          size="small"
          variant="secondary"
          buttonStyle={styles.actionButton}
          onPress={() =>
            navigation.navigate("DiaryList", { childId: child.id })
          }
        />
        <Button
          title="성장 기록"
          size="small"
          variant="outline"
          buttonStyle={styles.actionButton}
          onPress={() =>
            navigation.navigate("GrowthChart", { childId: child.id })
          }
        />
      </View>
    </Card>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
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
          <Text style={styles.title}>아이들</Text>
          <Text style={styles.subtitle}>
            등록된 아이들의 프로필을 관리하세요
          </Text>
        </View>

        {children.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              아직 등록된 아이가 없습니다.{"\n"}첫 번째 아이의 프로필을
              만들어보세요!
            </Text>
            <Button
              title="첫 아이 프로필 만들기"
              onPress={() => navigation.navigate("ChildProfile", {})}
            />
          </View>
        ) : (
          <>
            {children.map(renderChildCard)}
            <Button
              title="새 아이 프로필 추가"
              variant="outline"
              buttonStyle={styles.addButton}
              onPress={() => navigation.navigate("ChildProfile", {})}
            />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
