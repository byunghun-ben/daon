import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  Alert,
  TouchableOpacity,
} from "react-native";
import { useThemedStyles } from "../../shared/lib/hooks/useTheme";
import { SCREEN_PADDING, COLORS } from "../../shared/config/theme";
import Button from "../../shared/ui/Button";
import Input from "../../shared/ui/Input";
import Card from "../../shared/ui/Card";
import { 
  activitiesApi, 
  type CreateActivityRequest,
  type Activity 
} from "../../shared/api/activities";
import { childrenApi, type Child } from "../../shared/api/children";

interface RecordActivityScreenProps {
  navigation: any;
  route?: {
    params?: {
      type?: "feeding" | "diaper" | "sleep" | "tummy_time" | "custom";
      childId?: string;
    };
  };
}

const ACTIVITY_TYPES = [
  { key: "feeding", label: "수유", color: COLORS.activity.feeding, icon: "🍼" },
  { key: "diaper", label: "기저귀", color: COLORS.activity.diaper, icon: "👶" },
  { key: "sleep", label: "수면", color: COLORS.activity.sleep, icon: "😴" },
  { key: "tummy_time", label: "배 뒤집기", color: COLORS.activity.tummyTime, icon: "🤸" },
  { key: "custom", label: "기타", color: COLORS.activity.custom, icon: "📝" },
] as const;

export default function RecordActivityScreen({ navigation, route }: RecordActivityScreenProps) {
  const { type: initialType, childId: initialChildId } = route?.params || {};
  
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<string>(initialChildId || "");
  const [activityType, setActivityType] = useState<string>(initialType || "");
  const [formData, setFormData] = useState({
    started_at: new Date().toISOString(),
    ended_at: "",
    notes: "",
    metadata: {} as Record<string, any>,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

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
    section: {
      marginBottom: theme.spacing.xl,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "600" as const,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.md,
    },
    childSelector: {
      flexDirection: "row" as const,
      flexWrap: "wrap" as const,
      gap: theme.spacing.sm,
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
    activityTypes: {
      flexDirection: "row" as const,
      flexWrap: "wrap" as const,
      gap: theme.spacing.sm,
    },
    activityButton: {
      flex: 1,
      minWidth: "45%",
      aspectRatio: 1.5,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 2,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      alignItems: "center" as const,
      justifyContent: "center" as const,
    },
    activityButtonSelected: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primary + "10",
    },
    activityIcon: {
      fontSize: 32,
      marginBottom: theme.spacing.xs,
    },
    activityLabel: {
      fontSize: theme.typography.body2.fontSize,
      fontWeight: "600" as const,
      color: theme.colors.text.primary,
      textAlign: "center" as const,
    },
    timeContainer: {
      flexDirection: "row" as const,
      gap: theme.spacing.md,
    },
    timeInput: {
      flex: 1,
    },
    metadataContainer: {
      marginTop: theme.spacing.md,
    },
  }));

  useEffect(() => {
    loadChildren();
  }, []);

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

  const formatDateTime = (date: Date): string => {
    return date.toISOString().slice(0, 16); // YYYY-MM-DDTHH:mm
  };

  const parseDateTime = (dateTimeString: string): Date => {
    return new Date(dateTimeString);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!selectedChild) {
      newErrors.child = "아이를 선택해주세요";
    }

    if (!activityType) {
      newErrors.activityType = "활동 유형을 선택해주세요";
    }

    if (!formData.started_at) {
      newErrors.started_at = "시작 시간을 입력해주세요";
    }

    if (formData.ended_at && new Date(formData.ended_at) <= new Date(formData.started_at)) {
      newErrors.ended_at = "종료 시간은 시작 시간보다 늦어야 합니다";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const activityData: CreateActivityRequest = {
        child_id: selectedChild,
        type: activityType as any,
        started_at: formData.started_at,
        ended_at: formData.ended_at || undefined,
        notes: formData.notes || undefined,
        metadata: formData.metadata,
      };

      await activitiesApi.createActivity(activityData);
      
      Alert.alert("성공", "활동이 기록되었습니다!", [
        { text: "확인", onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      Alert.alert(
        "오류",
        error.message || "활동 기록 중 오류가 발생했습니다."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const renderMetadataInputs = () => {
    switch (activityType) {
      case "feeding":
        return (
          <View style={styles.metadataContainer}>
            <Input
              label="수유량 (ml)"
              value={formData.metadata.amount?.toString() || ""}
              onChangeText={(amount) => 
                setFormData({
                  ...formData,
                  metadata: { ...formData.metadata, amount: amount ? parseInt(amount) : undefined }
                })
              }
              keyboardType="numeric"
              placeholder="예: 120"
            />
            <Input
              label="수유 종류"
              value={formData.metadata.type || ""}
              onChangeText={(type) => 
                setFormData({
                  ...formData,
                  metadata: { ...formData.metadata, type }
                })
              }
              placeholder="예: 모유, 분유, 이유식"
            />
          </View>
        );
      
      case "diaper":
        return (
          <View style={styles.metadataContainer}>
            <Input
              label="기저귀 상태"
              value={formData.metadata.type || ""}
              onChangeText={(type) => 
                setFormData({
                  ...formData,
                  metadata: { ...formData.metadata, type }
                })
              }
              placeholder="예: 소변, 대변, 소변+대변"
            />
          </View>
        );
      
      case "sleep":
        return (
          <View style={styles.metadataContainer}>
            <Input
              label="수면 품질"
              value={formData.metadata.quality || ""}
              onChangeText={(quality) => 
                setFormData({
                  ...formData,
                  metadata: { ...formData.metadata, quality }
                })
              }
              placeholder="예: 좋음, 보통, 나쁨"
            />
          </View>
        );
      
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>활동 기록</Text>
          <Text style={styles.subtitle}>
            아이의 일상 활동을 기록해보세요
          </Text>
        </View>

        {/* Child Selection */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>아이 선택</Text>
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
          {errors.child && <Text style={{ color: "red" }}>{errors.child}</Text>}
        </Card>

        {/* Activity Type Selection */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>활동 유형</Text>
          <View style={styles.activityTypes}>
            {ACTIVITY_TYPES.map((activity) => (
              <TouchableOpacity
                key={activity.key}
                style={[
                  styles.activityButton,
                  activityType === activity.key && styles.activityButtonSelected,
                ]}
                onPress={() => setActivityType(activity.key)}
              >
                <Text style={styles.activityIcon}>{activity.icon}</Text>
                <Text style={styles.activityLabel}>{activity.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {errors.activityType && <Text style={{ color: "red" }}>{errors.activityType}</Text>}
        </Card>

        {/* Time Input */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>시간</Text>
          <View style={styles.timeContainer}>
            <Input
              label="시작 시간"
              value={formatDateTime(new Date(formData.started_at))}
              onChangeText={(started_at) => 
                setFormData({ ...formData, started_at: new Date(started_at).toISOString() })
              }
              containerStyle={styles.timeInput}
              error={errors.started_at}
            />
            
            <Input
              label="종료 시간 (선택사항)"
              value={formData.ended_at ? formatDateTime(new Date(formData.ended_at)) : ""}
              onChangeText={(ended_at) => 
                setFormData({ 
                  ...formData, 
                  ended_at: ended_at ? new Date(ended_at).toISOString() : "" 
                })
              }
              containerStyle={styles.timeInput}
              error={errors.ended_at}
            />
          </View>
        </Card>

        {/* Activity-specific metadata */}
        {activityType && (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>세부 정보</Text>
            {renderMetadataInputs()}
          </Card>
        )}

        {/* Notes */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>메모</Text>
          <Input
            label="추가 메모 (선택사항)"
            value={formData.notes}
            onChangeText={(notes) => setFormData({ ...formData, notes })}
            multiline
            numberOfLines={3}
            placeholder="특이사항이나 추가 정보를 입력하세요"
          />
        </Card>

        {/* Save Button */}
        <Button
          title={isLoading ? "저장 중..." : "활동 기록 저장"}
          onPress={handleSave}
          disabled={isLoading}
        />
      </ScrollView>
    </SafeAreaView>
  );
}