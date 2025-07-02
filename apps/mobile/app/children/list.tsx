import { useRouter, Stack } from "expo-router";
import React from "react";
import {
  Alert,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from "react-native";
import { ChildCard } from "../../entities";
import { useChildren } from "../../shared/api/hooks/useChildren";
import type { ChildApi } from "@daon/shared";
import { useThemedStyles } from "../../shared/lib/hooks/useTheme";
import { useActiveChild } from "../../shared/hooks/useActiveChild";
import { Button } from "../../shared/ui";
import Card from "../../shared/ui/Card";

export default function ChildrenListScreen() {
  const router = useRouter();
  const { activeChild, switchChild } = useActiveChild();

  const { data: childrenData, isLoading, error, refetch } = useChildren();

  const children = childrenData?.children || [];

  const styles = useThemedStyles((theme) => ({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      padding: theme.spacing.lg,
    },
    emptyState: {
      alignItems: "center" as const,
      justifyContent: "center" as const,
      padding: theme.spacing.xxl,
    },
    emptyText: {
      fontSize: theme.typography.body1.fontSize,
      color: theme.colors.text.secondary,
      textAlign: "center" as const,
      marginBottom: theme.spacing.lg,
    },
    loadingText: {
      textAlign: "center" as const,
      color: theme.colors.text.secondary,
      padding: theme.spacing.lg,
    },
    errorText: {
      textAlign: "center" as const,
      color: theme.colors.error,
      padding: theme.spacing.lg,
    },
    header: {
      marginBottom: theme.spacing.lg,
    },
    title: {
      fontSize: theme.typography.title.fontSize,
      fontWeight: theme.typography.title.fontWeight,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.sm,
    },
    subtitle: {
      fontSize: theme.typography.body2.fontSize,
      color: theme.colors.text.secondary,
    },
    activeChildBadge: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.sm,
      alignSelf: "flex-start" as const,
      marginBottom: theme.spacing.sm,
    },
    activeChildText: {
      color: theme.colors.white,
      fontSize: theme.typography.caption.fontSize,
      fontWeight: "600" as const,
    },
    addButtonContainer: {
      marginTop: theme.spacing.lg,
    },
  }));

  const handleChildPress = (child: ChildApi) => {
    Alert.alert(
      "아이 선택",
      `${child.name}을(를) 활성 아이로 설정하시겠습니까?`,
      [
        { text: "취소", style: "cancel" },
        {
          text: "선택",
          onPress: () => switchChild(child.id),
        },
      ],
    );
  };

  const handleAddChild = () => {
    router.push("/children/create");
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen
          options={{
            title: "아이 관리",
          }}
        />
        <Text style={styles.loadingText}>아이 목록을 불러오는 중...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen
          options={{
            title: "아이 관리",
          }}
        />
        <View style={styles.content}>
          <Text style={styles.errorText}>
            아이 목록을 불러오는 중 오류가 발생했습니다.
          </Text>
          <Button title="다시 시도" onPress={() => refetch()} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: "아이 관리",
        }}
      />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>등록된 아이들</Text>
          <Text style={styles.subtitle}>
            아이를 선택하여 활성 아이로 설정하거나 정보를 수정할 수 있습니다
          </Text>
        </View>

        {activeChild && (
          <View style={styles.activeChildBadge}>
            <Text style={styles.activeChildText}>
              현재 활성: {activeChild.name}
            </Text>
          </View>
        )}

        {children.length === 0 ? (
          <Card>
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                등록된 아이가 없습니다.{"\n"}첫 번째 아이를 등록해보세요!
              </Text>
              <Button
                title="아이 추가"
                onPress={handleAddChild}
                variant="primary"
              />
            </View>
          </Card>
        ) : (
          <>
            {children.map((child) => (
              <ChildCard
                key={child.id}
                child={child}
                onPress={handleChildPress}
                isSelected={activeChild?.id === child.id}
                showDetails={true}
              />
            ))}

            <View style={styles.addButtonContainer}>
              <Button
                title="새 아이 추가"
                onPress={handleAddChild}
                variant="outline"
              />
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
