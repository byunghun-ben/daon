import { ActivityCard } from "@/entities/activity/ActivityCard";
import Button from "@/shared/ui/Button/Button";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Alert, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  useActivity,
  useDeleteActivity,
} from "../../shared/api/hooks/useActivities";
import { useThemedStyles } from "../../shared/lib/hooks/useTheme";

export default function ActivityDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { data: activityData, isLoading, error } = useActivity(id!);
  const activity = activityData?.activity;
  const deleteActivityMutation = useDeleteActivity();

  const styles = useThemedStyles((theme) => ({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      padding: theme.spacing.md,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center" as const,
      alignItems: "center" as const,
    },
    loadingText: {
      fontSize: theme.typography.body1.fontSize,
      color: theme.colors.textSecondary,
    },
    errorContainer: {
      flex: 1,
      justifyContent: "center" as const,
      alignItems: "center" as const,
      padding: theme.spacing.md,
    },
    errorText: {
      fontSize: theme.typography.body1.fontSize,
      color: theme.colors.error,
      textAlign: "center" as const,
      marginBottom: theme.spacing.md,
    },
    actionsContainer: {
      padding: theme.spacing.md,
      gap: theme.spacing.sm,
    },
    deleteButton: {
      backgroundColor: theme.colors.error,
    },
  }));

  const handleDelete = () => {
    Alert.alert("활동 삭제", "이 활동을 삭제하시겠습니까?", [
      {
        text: "취소",
        style: "cancel",
      },
      {
        text: "삭제",
        style: "destructive",
        onPress: () => {
          deleteActivityMutation.mutate(id!, {
            onSuccess: () => {
              router.back();
            },
            onError: () => {
              Alert.alert("오류", "활동 삭제에 실패했습니다.");
            },
          });
        },
      },
    ]);
  };

  const handleEdit = () => {
    router.push(`/activities/${id}/edit`);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen
          options={{
            title: "활동 상세",
          }}
        />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>로딩 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !activity) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen
          options={{
            title: "활동 상세",
          }}
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>활동을 불러오는데 실패했습니다.</Text>
          <Button title="다시 시도" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: "활동 상세",
        }}
      />

      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <ActivityCard activity={activity} showUser={true} />
        </View>
      </ScrollView>

      <View style={styles.actionsContainer}>
        <Button title="수정" onPress={handleEdit} variant="outline" />
        <Button
          title="삭제"
          onPress={handleDelete}
          style={styles.deleteButton}
          disabled={deleteActivityMutation.isPending}
        />
      </View>
    </SafeAreaView>
  );
}
