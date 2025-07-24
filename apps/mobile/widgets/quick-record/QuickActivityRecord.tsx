import { ButtonText, ButtonV2 } from "@/shared/ui/Button/ButtonV2";
import type {
  ActivityType,
  CreateActivityRequest,
  CreateDiaperDataRequest,
  CreateFeedingDataRequest,
  CreateSleepDataRequest,
  CreateTummyTimeDataRequest,
} from "@daon/shared";
import React, { useState } from "react";
import { Alert, ScrollView, Text, TextInput, View } from "react-native";
import { useCreateActivity } from "../../shared/api/hooks/useActivities";
import { useThemedStyles } from "../../shared/lib/hooks/useTheme";

interface QuickActivityRecordProps {
  activityType: ActivityType;
  childId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const QuickActivityRecord: React.FC<QuickActivityRecordProps> = ({
  activityType,
  childId,
  onSuccess,
  onCancel,
}) => {
  const [notes, setNotes] = useState("");
  const [feedingData, setFeedingData] = useState<
    Partial<CreateFeedingDataRequest>
  >({
    type: "breast",
    amount: undefined,
    duration: undefined,
    side: undefined,
  });
  const [diaperData, setDiaperData] = useState<
    Partial<CreateDiaperDataRequest>
  >({
    type: "wet",
  });
  const [sleepData, setSleepData] = useState<Partial<CreateSleepDataRequest>>({
    startedAt: new Date().toISOString(),
    endedAt: undefined,
    quality: "good",
  });
  const [tummyTimeData, setTummyTimeData] = useState<
    Partial<CreateTummyTimeDataRequest>
  >({
    duration: undefined,
  });

  const createActivityMutation = useCreateActivity();

  const styles = useThemedStyles((theme) => ({
    container: {
      flex: 1,
    },
    section: {
      marginBottom: theme.spacing.lg,
    },
    sectionTitle: {
      fontSize: theme.typography.subtitle.fontSize,
      fontWeight: "600" as const,
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 8,
      padding: theme.spacing.md,
      fontSize: theme.typography.body1.fontSize,
      color: theme.colors.text,
      backgroundColor: theme.colors.background,
      marginBottom: theme.spacing.md,
    },
    textArea: {
      height: 80,
      textAlignVertical: "top" as const,
    },
    buttonRow: {
      flexDirection: "row" as const,
      gap: theme.spacing.md,
      marginBottom: theme.spacing.md,
    },
    optionButton: {
      flex: 1,
    },
    actions: {
      flexDirection: "row" as const,
      gap: theme.spacing.md,
      marginTop: theme.spacing.lg,
    },
    actionButton: {
      flex: 1,
    },
    label: {
      fontSize: theme.typography.body2.fontSize,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.xs,
    },
  }));

  const handleSubmit = async () => {
    try {
      let data = {};

      switch (activityType) {
        case "feeding":
          data = feedingData;
          break;
        case "diaper":
          data = diaperData;
          break;
        case "sleep":
          data = sleepData;
          break;
        case "tummy_time":
          data = tummyTimeData;
          break;
      }

      const activityData: CreateActivityRequest = {
        childId,
        type: activityType,
        timestamp: new Date().toISOString(),
        data: data as CreateActivityRequest["data"],
        notes: notes.trim() || undefined,
      };

      await createActivityMutation.mutateAsync(activityData);
      onSuccess();
    } catch (error) {
      console.error(error);
      Alert.alert("오류", "활동 기록을 저장하는데 실패했습니다.");
    }
  };

  const renderFeedingOptions = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>수유 정보</Text>
      <Text style={styles.label}>수유 타입</Text>
      <View style={styles.buttonRow}>
        <ButtonV2
          variant={feedingData.type === "breast" ? "default" : "outline"}
          style={styles.optionButton}
          onPress={() =>
            setFeedingData((prev: Partial<CreateFeedingDataRequest>) => ({
              ...prev,
              type: "breast",
            }))
          }
        >
          <ButtonText>모유</ButtonText>
        </ButtonV2>
        <ButtonV2
          variant={feedingData.type === "bottle" ? "default" : "outline"}
          style={styles.optionButton}
          onPress={() =>
            setFeedingData((prev: Partial<CreateFeedingDataRequest>) => ({
              ...prev,
              type: "bottle",
            }))
          }
        >
          <ButtonText>분유</ButtonText>
        </ButtonV2>
        <ButtonV2
          variant={feedingData.type === "solid" ? "default" : "outline"}
          style={styles.optionButton}
          onPress={() =>
            setFeedingData((prev: Partial<CreateFeedingDataRequest>) => ({
              ...prev,
              type: "solid",
            }))
          }
        >
          <ButtonText>이유식</ButtonText>
        </ButtonV2>
      </View>
      {feedingData.type !== "breast" && (
        <>
          <Text style={styles.label}>양 (ml)</Text>
          <TextInput
            style={styles.input}
            placeholder="100"
            keyboardType="numeric"
            value={feedingData.amount?.toString() || ""}
            onChangeText={(text) =>
              setFeedingData((prev: Partial<CreateFeedingDataRequest>) => ({
                ...prev,
                amount: text ? parseInt(text, 10) : undefined,
              }))
            }
          />
        </>
      )}
      <Text style={styles.label}>시간 (분)</Text>
      <TextInput
        style={styles.input}
        placeholder="15"
        keyboardType="numeric"
        value={feedingData.duration?.toString() || ""}
        onChangeText={(text) =>
          setFeedingData((prev: Partial<CreateFeedingDataRequest>) => ({
            ...prev,
            duration: text ? parseInt(text, 10) : undefined,
          }))
        }
      />
    </View>
  );

  const renderDiaperOptions = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>기저귀 정보</Text>
      <Text style={styles.label}>타입</Text>
      <View style={styles.buttonRow}>
        <ButtonV2
          variant={diaperData.type === "wet" ? "default" : "outline"}
          style={styles.optionButton}
          onPress={() =>
            setDiaperData((prev: Partial<CreateDiaperDataRequest>) => ({
              ...prev,
              type: "wet",
            }))
          }
        >
          <ButtonText>소변</ButtonText>
        </ButtonV2>
        <ButtonV2
          variant={diaperData.type === "dirty" ? "default" : "outline"}
          style={styles.optionButton}
          onPress={() =>
            setDiaperData((prev: Partial<CreateDiaperDataRequest>) => ({
              ...prev,
              type: "dirty",
            }))
          }
        >
          <ButtonText>대변</ButtonText>
        </ButtonV2>
        <ButtonV2
          variant={diaperData.type === "both" ? "default" : "outline"}
          style={styles.optionButton}
          onPress={() =>
            setDiaperData((prev: Partial<CreateDiaperDataRequest>) => ({
              ...prev,
              type: "both",
            }))
          }
        >
          <ButtonText>둘 다</ButtonText>
        </ButtonV2>
      </View>
    </View>
  );

  const renderSleepOptions = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>수면 정보</Text>
      <Text style={styles.label}>수면 품질</Text>
      <View style={styles.buttonRow}>
        <ButtonV2
          variant={sleepData.quality === "good" ? "default" : "outline"}
          style={styles.optionButton}
          onPress={() =>
            setSleepData((prev: Partial<CreateSleepDataRequest>) => ({
              ...prev,
              quality: "good",
            }))
          }
        >
          <ButtonText>좋음</ButtonText>
        </ButtonV2>
        <ButtonV2
          variant={sleepData.quality === "fair" ? "default" : "outline"}
          style={styles.optionButton}
          onPress={() =>
            setSleepData((prev: Partial<CreateSleepDataRequest>) => ({
              ...prev,
              quality: "fair",
            }))
          }
        >
          <ButtonText>보통</ButtonText>
        </ButtonV2>
        <ButtonV2
          variant={sleepData.quality === "poor" ? "default" : "outline"}
          style={styles.optionButton}
          onPress={() =>
            setSleepData((prev: Partial<CreateSleepDataRequest>) => ({
              ...prev,
              quality: "poor",
            }))
          }
        >
          <ButtonText>나쁨</ButtonText>
        </ButtonV2>
      </View>
    </View>
  );

  const renderTummyTimeOptions = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>배밀이 정보</Text>
      <Text style={styles.label}>시간 (분)</Text>
      <TextInput
        style={styles.input}
        placeholder="10"
        keyboardType="numeric"
        value={tummyTimeData.duration?.toString() || ""}
        onChangeText={(text) =>
          setTummyTimeData((prev: Partial<CreateTummyTimeDataRequest>) => ({
            ...prev,
            duration: text ? parseInt(text, 10) : undefined,
          }))
        }
      />
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {activityType === "feeding" && renderFeedingOptions()}
      {activityType === "diaper" && renderDiaperOptions()}
      {activityType === "sleep" && renderSleepOptions()}
      {activityType === "tummy_time" && renderTummyTimeOptions()}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>메모</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="추가 메모를 입력하세요..."
          multiline
          value={notes}
          onChangeText={setNotes}
        />
      </View>

      <View style={styles.actions}>
        <ButtonV2 variant="outline" onPress={onCancel}>
          <ButtonText>취소</ButtonText>
        </ButtonV2>
        <ButtonV2 onPress={handleSubmit} variant="default">
          <ButtonText>저장</ButtonText>
        </ButtonV2>
      </View>
    </ScrollView>
  );
};

export default QuickActivityRecord;
