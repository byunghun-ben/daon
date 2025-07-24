import { GrowthRecordCard } from "@/entities/growth-record/GrowthRecordCard";
import { useDeleteGrowthRecord } from "@/shared/api/growth/hooks/useDeleteGrowthRecord";
import { useGrowthRecord } from "@/shared/api/growth/hooks/useGrowthRecord";
import { useThemedStyles } from "@/shared/lib/hooks/useTheme";
import { ButtonV2, ButtonText } from "@/shared/ui/Button/ButtonV2";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Alert, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function GrowthDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { data: growthRecordData, isLoading, error } = useGrowthRecord(id!);
  const growthRecord = growthRecordData?.growthRecord;
  const deleteGrowthRecordMutation = useDeleteGrowthRecord();

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
    Alert.alert("성장 기록 삭제", "이 성장 기록을 삭제하시겠습니까?", [
      {
        text: "취소",
        style: "cancel",
      },
      {
        text: "삭제",
        style: "destructive",
        onPress: () => {
          deleteGrowthRecordMutation.mutate(id!, {
            onSuccess: () => {
              router.back();
            },
            onError: () => {
              Alert.alert("오류", "성장 기록 삭제에 실패했습니다.");
            },
          });
        },
      },
    ]);
  };

  const handleEdit = () => {
    router.push(`/growth/${id}/edit`);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen
          options={{
            title: "성장 기록 상세",
          }}
        />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>로딩 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !growthRecord) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen
          options={{
            title: "성장 기록 상세",
          }}
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            성장 기록을 불러오는데 실패했습니다.
          </Text>
          <ButtonV2 onPress={() => router.back()}>
            <ButtonText>다시 시도</ButtonText>
          </ButtonV2>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: "성장 기록 상세",
        }}
      />

      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <GrowthRecordCard
            growthRecord={growthRecord}
            showUser={true}
            showAge={false}
          />
        </View>
      </ScrollView>

      <View style={styles.actionsContainer}>
        <ButtonV2 onPress={handleEdit} variant="outline">
          <ButtonText>수정</ButtonText>
        </ButtonV2>
        <ButtonV2
          onPress={handleDelete}
          style={styles.deleteButton}
          disabled={deleteGrowthRecordMutation.isPending}
        >
          <ButtonText>삭제</ButtonText>
        </ButtonV2>
      </View>
    </SafeAreaView>
  );
}
