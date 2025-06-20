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
import { SCREEN_PADDING } from "../../shared/config/theme";
import Button from "../../shared/ui/Button";
import Input from "../../shared/ui/Input";
import Card from "../../shared/ui/Card";
import { 
  growthApi, 
  type CreateGrowthRecordRequest,
  type GrowthRecord 
} from "../../shared/api/growth";
import { childrenApi, type Child } from "../../shared/api/children";

interface AddGrowthRecordScreenProps {
  navigation: any;
  route?: {
    params?: {
      childId?: string;
      recordId?: string;
      isEditing?: boolean;
    };
  };
}

export default function AddGrowthRecordScreen({ navigation, route }: AddGrowthRecordScreenProps) {
  const { childId: initialChildId, recordId, isEditing = false } = route?.params || {};
  
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<string>(initialChildId || "");
  const [formData, setFormData] = useState<CreateGrowthRecordRequest>({
    child_id: "",
    recorded_at: new Date().toISOString().split("T")[0], // YYYY-MM-DD format
    height_cm: undefined,
    weight_kg: undefined,
    head_circumference_cm: undefined,
    notes: "",
  });
  const [record, setRecord] = useState<GrowthRecord | null>(null);
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
    measurementRow: {
      flexDirection: "row" as const,
      gap: theme.spacing.md,
    },
    measurementInput: {
      flex: 1,
    },
    measurementInfo: {
      flexDirection: "row" as const,
      justifyContent: "space-between" as const,
      marginTop: theme.spacing.sm,
      paddingHorizontal: theme.spacing.sm,
    },
    infoText: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.text.muted,
    },
    helpText: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.text.secondary,
      fontStyle: "italic" as const,
      marginTop: theme.spacing.xs,
      paddingHorizontal: theme.spacing.sm,
    },
    error: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.error,
      marginTop: theme.spacing.xs,
    },
  }));

  useEffect(() => {
    loadChildren();
  }, []);

  useEffect(() => {
    if (recordId && isEditing) {
      loadRecord();
    }
  }, [recordId, isEditing]);

  const loadChildren = async () => {
    try {
      const response = await childrenApi.getChildren();
      setChildren(response.children);
      
      // If no child is selected and there's only one child, select it automatically
      if (!selectedChild && response.children.length === 1) {
        const childId = response.children[0].id;
        setSelectedChild(childId);
        setFormData(prev => ({ ...prev, child_id: childId }));
      }
    } catch (error: any) {
      Alert.alert("오류", "아이 목록을 불러오는데 실패했습니다.");
    }
  };

  const loadRecord = async () => {
    if (!recordId) return;
    
    setIsLoading(true);
    try {
      const response = await growthApi.getGrowthRecord(recordId);
      setRecord(response.growthRecord);
      setFormData({
        child_id: response.growthRecord.child_id,
        recorded_at: response.growthRecord.recorded_at.split("T")[0],
        height_cm: response.growthRecord.height_cm,
        weight_kg: response.growthRecord.weight_kg,
        head_circumference_cm: response.growthRecord.head_circumference_cm,
        notes: response.growthRecord.notes || "",
      });
      setSelectedChild(response.growthRecord.child_id);
    } catch (error: any) {
      Alert.alert("오류", "성장 기록을 불러오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!selectedChild) {
      newErrors.child = "아이를 선택해주세요";
    }

    if (!formData.recorded_at) {
      newErrors.recorded_at = "측정 날짜를 입력해주세요";
    }

    // At least one measurement should be provided
    if (!formData.height_cm && !formData.weight_kg && !formData.head_circumference_cm) {
      newErrors.measurements = "키, 몸무게, 머리둘레 중 최소 하나는 입력해주세요";
    }

    // Validate measurements ranges
    if (formData.height_cm !== undefined) {
      if (formData.height_cm <= 0 || formData.height_cm > 200) {
        newErrors.height_cm = "올바른 키를 입력해주세요 (1-200cm)";
      }
    }

    if (formData.weight_kg !== undefined) {
      if (formData.weight_kg <= 0 || formData.weight_kg > 50) {
        newErrors.weight_kg = "올바른 몸무게를 입력해주세요 (0.1-50kg)";
      }
    }

    if (formData.head_circumference_cm !== undefined) {
      if (formData.head_circumference_cm <= 0 || formData.head_circumference_cm > 70) {
        newErrors.head_circumference_cm = "올바른 머리둘레를 입력해주세요 (1-70cm)";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const recordData = {
        ...formData,
        child_id: selectedChild,
      };

      if (isEditing && recordId) {
        await growthApi.updateGrowthRecord(recordId, recordData);
        Alert.alert("성공", "성장 기록이 수정되었습니다!", [
          { text: "확인", onPress: () => navigation.goBack() },
        ]);
      } else {
        await growthApi.createGrowthRecord(recordData);
        Alert.alert("성공", "성장 기록이 저장되었습니다!", [
          { text: "확인", onPress: () => navigation.goBack() },
        ]);
      }
    } catch (error: any) {
      Alert.alert(
        "오류",
        error.message || "성장 기록 저장 중 오류가 발생했습니다."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const calculateAge = (childId: string, recordedAt: string): string => {
    const child = children.find(c => c.id === childId);
    if (!child) return "";
    
    const birthDate = new Date(child.birth_date);
    const recordDate = new Date(recordedAt);
    const diffTime = recordDate.getTime() - birthDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return "출생 전";
    
    const months = Math.floor(diffDays / 30);
    const weeks = Math.floor((diffDays % 30) / 7);
    const days = diffDays % 7;
    
    if (months > 0) {
      return `${months}개월 ${weeks}주`;
    } else if (weeks > 0) {
      return `${weeks}주 ${days}일`;
    } else {
      return `${diffDays}일`;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {isEditing ? "성장 기록 수정" : "성장 기록 추가"}
          </Text>
          <Text style={styles.subtitle}>
            {isEditing 
              ? "아이의 성장 기록을 수정해주세요" 
              : "아이의 키, 몸무게, 머리둘레를 기록해주세요"
            }
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
                onPress={() => {
                  setSelectedChild(child.id);
                  setFormData(prev => ({ ...prev, child_id: child.id }));
                }}
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
          {errors.child && <Text style={styles.error}>{errors.child}</Text>}
        </Card>

        {/* Date Selection */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>측정 날짜</Text>
          <Input
            value={formData.recorded_at}
            onChangeText={(recorded_at) => setFormData({ ...formData, recorded_at })}
            error={errors.recorded_at}
            placeholder="YYYY-MM-DD"
          />
          {selectedChild && formData.recorded_at && (
            <Text style={styles.infoText}>
              측정 시 나이: {calculateAge(selectedChild, formData.recorded_at)}
            </Text>
          )}
        </Card>

        {/* Measurements */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>측정값</Text>
          
          {/* Height and Weight */}
          <View style={styles.measurementRow}>
            <Input
              label="키 (cm)"
              value={formData.height_cm?.toString() || ""}
              onChangeText={(height) => 
                setFormData({ 
                  ...formData, 
                  height_cm: height ? parseFloat(height) : undefined 
                })
              }
              keyboardType="numeric"
              placeholder="예: 65.5"
              containerStyle={styles.measurementInput}
              error={errors.height_cm}
            />
            
            <Input
              label="몸무게 (kg)"
              value={formData.weight_kg?.toString() || ""}
              onChangeText={(weight) => 
                setFormData({ 
                  ...formData, 
                  weight_kg: weight ? parseFloat(weight) : undefined 
                })
              }
              keyboardType="numeric"
              placeholder="예: 7.2"
              containerStyle={styles.measurementInput}
              error={errors.weight_kg}
            />
          </View>

          {/* Head Circumference */}
          <Input
            label="머리둘레 (cm)"
            value={formData.head_circumference_cm?.toString() || ""}
            onChangeText={(headCirc) => 
              setFormData({ 
                ...formData, 
                head_circumference_cm: headCirc ? parseFloat(headCirc) : undefined 
              })
            }
            keyboardType="numeric"
            placeholder="예: 42.0"
            error={errors.head_circumference_cm}
          />

          {errors.measurements && <Text style={styles.error}>{errors.measurements}</Text>}
          
          <Text style={styles.helpText}>
            💡 정확한 측정을 위해 동일한 시간대(예: 오전)에 측정하는 것을 권장합니다.
          </Text>
        </Card>

        {/* Notes */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>메모</Text>
          <Input
            label="추가 메모 (선택사항)"
            value={formData.notes}
            onChangeText={(notes) => setFormData({ ...formData, notes })}
            multiline
            numberOfLines={3}
            placeholder="측정 시 특이사항이나 참고사항을 입력하세요"
          />
        </Card>

        {/* Save Button */}
        <Button
          title={isLoading ? "저장 중..." : isEditing ? "기록 수정" : "기록 저장"}
          onPress={handleSave}
          disabled={isLoading}
        />
      </ScrollView>
    </SafeAreaView>
  );
}