import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Dimensions,
} from "react-native";
import { useThemedStyles } from "../../shared/lib/hooks/useTheme";
import { SCREEN_PADDING } from "../../shared/config/theme";
import Button from "../../shared/ui/Button";
import Card from "../../shared/ui/Card";
import { 
  growthApi, 
  type GrowthRecord,
  type GrowthFilters,
  type GrowthChartData 
} from "../../shared/api/growth";
import { childrenApi, type Child } from "../../shared/api/children";

interface GrowthChartScreenProps {
  navigation: any;
  route?: {
    params?: {
      childId?: string;
    };
  };
}

const { width: screenWidth } = Dimensions.get("window");

export default function GrowthChartScreen({ navigation, route }: GrowthChartScreenProps) {
  const { childId: initialChildId } = route?.params || {};
  
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<string>(initialChildId || "");
  const [growthRecords, setGrowthRecords] = useState<GrowthRecord[]>([]);
  const [chartData, setChartData] = useState<GrowthChartData | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<"height" | "weight" | "head">("height");
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
    metricSelector: {
      flexDirection: "row" as const,
      marginBottom: theme.spacing.xl,
    },
    metricButton: {
      flex: 1,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.sm,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      alignItems: "center" as const,
    },
    metricButtonFirst: {
      borderTopLeftRadius: theme.borderRadius.md,
      borderBottomLeftRadius: theme.borderRadius.md,
    },
    metricButtonLast: {
      borderTopRightRadius: theme.borderRadius.md,
      borderBottomRightRadius: theme.borderRadius.md,
      borderLeftWidth: 0,
    },
    metricButtonMiddle: {
      borderLeftWidth: 0,
    },
    metricButtonSelected: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    metricButtonText: {
      fontSize: theme.typography.body2.fontSize,
      fontWeight: "600" as const,
      color: theme.colors.text.primary,
    },
    metricButtonTextSelected: {
      color: theme.colors.surface,
    },
    chartCard: {
      marginBottom: theme.spacing.xl,
      minHeight: 250,
    },
    chartTitle: {
      fontSize: 18,
      fontWeight: "600" as const,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.md,
      textAlign: "center" as const,
    },
    chartPlaceholder: {
      height: 200,
      justifyContent: "center" as const,
      alignItems: "center" as const,
      backgroundColor: theme.colors.background,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderStyle: "dashed" as const,
    },
    chartPlaceholderText: {
      fontSize: theme.typography.body1.fontSize,
      color: theme.colors.text.muted,
      textAlign: "center" as const,
    },
    recordsSection: {
      marginBottom: theme.spacing.xl,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "600" as const,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.md,
    },
    recordCard: {
      marginBottom: theme.spacing.md,
    },
    recordHeader: {
      flexDirection: "row" as const,
      justifyContent: "space-between" as const,
      alignItems: "center" as const,
      marginBottom: theme.spacing.sm,
    },
    recordDate: {
      fontSize: theme.typography.body1.fontSize,
      fontWeight: "600" as const,
      color: theme.colors.text.primary,
    },
    recordAge: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.text.secondary,
    },
    recordMeasurements: {
      flexDirection: "row" as const,
      justifyContent: "space-around" as const,
      marginBottom: theme.spacing.sm,
    },
    measurementItem: {
      alignItems: "center" as const,
    },
    measurementValue: {
      fontSize: theme.typography.body1.fontSize,
      fontWeight: "600" as const,
      color: theme.colors.text.primary,
    },
    measurementLabel: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.text.secondary,
      marginTop: theme.spacing.xs,
    },
    recordNotes: {
      fontSize: theme.typography.body2.fontSize,
      color: theme.colors.text.secondary,
      fontStyle: "italic" as const,
      marginTop: theme.spacing.xs,
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
      loadGrowthData();
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

  const loadGrowthData = async () => {
    if (!selectedChild) return;
    
    try {
      // Load growth records
      const filters: GrowthFilters = {
        childId: selectedChild,
        limit: 100,
        offset: 0,
      };
      
      const recordsResponse = await growthApi.getGrowthRecords(filters);
      setGrowthRecords(recordsResponse.growthRecords);

      // Load chart data
      try {
        const chartResponse = await growthApi.getGrowthChart(selectedChild);
        setChartData(chartResponse.chart);
      } catch (chartError) {
        // Chart data might not be available, but that's okay
        console.warn("Chart data not available:", chartError);
      }
    } catch (error: any) {
      Alert.alert("오류", "성장 데이터를 불러오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadGrowthData();
  }, [selectedChild]);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const calculateAge = (childId: string, recordedAt: string): string => {
    const child = children.find(c => c.id === childId);
    if (!child) return "";
    
    const birthDate = new Date(child.birthDate);
    const recordDate = new Date(recordedAt);
    const diffTime = recordDate.getTime() - birthDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return "출생 전";
    
    const months = Math.floor(diffDays / 30);
    const weeks = Math.floor((diffDays % 30) / 7);
    
    if (months > 0) {
      return `${months}개월`;
    } else {
      return `${weeks}주`;
    }
  };

  const getMetricTitle = (metric: string): string => {
    switch (metric) {
      case "height": return "키 성장 차트";
      case "weight": return "몸무게 성장 차트";
      case "head": return "머리둘레 성장 차트";
      default: return "성장 차트";
    }
  };

  const renderGrowthChart = () => {
    return (
      <Card style={styles.chartCard}>
        <Text style={styles.chartTitle}>
          {getMetricTitle(selectedMetric)}
        </Text>
        <View style={styles.chartPlaceholder}>
          <Text style={styles.chartPlaceholderText}>
            📊{"\n"}
            성장 차트 기능은 곧 업데이트됩니다.{"\n"}
            현재는 기록된 데이터를 아래에서 확인할 수 있습니다.
          </Text>
        </View>
      </Card>
    );
  };

  const renderRecordCard = (record: GrowthRecord) => (
    <Card key={record.id} style={styles.recordCard}>
      <TouchableOpacity
        onPress={() => navigation.navigate("AddGrowthRecord", { 
          recordId: record.id, 
          childId: record.childId,
          isEditing: true 
        })}
      >
        <View style={styles.recordHeader}>
          <View>
            <Text style={styles.recordDate}>
              {formatDate(record.recordedAt)}
            </Text>
            <Text style={styles.recordAge}>
              {calculateAge(record.childId, record.recordedAt)}
            </Text>
          </View>
        </View>
        
        <View style={styles.recordMeasurements}>
          {record.height && (
            <View style={styles.measurementItem}>
              <Text style={styles.measurementValue}>
                {record.height.toFixed(1)}cm
              </Text>
              <Text style={styles.measurementLabel}>키</Text>
            </View>
          )}
          
          {record.weight && (
            <View style={styles.measurementItem}>
              <Text style={styles.measurementValue}>
                {record.weight.toFixed(1)}kg
              </Text>
              <Text style={styles.measurementLabel}>몸무게</Text>
            </View>
          )}
          
          {record.headCircumference && (
            <View style={styles.measurementItem}>
              <Text style={styles.measurementValue}>
                {record.headCircumference.toFixed(1)}cm
              </Text>
              <Text style={styles.measurementLabel}>머리둘레</Text>
            </View>
          )}
        </View>
        
        {record.notes && (
          <Text style={styles.recordNotes}>
            "{record.notes}"
          </Text>
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
          <Text style={styles.title}>성장 차트</Text>
          <Text style={styles.subtitle}>
            아이의 성장 과정을 추적하고 기록하세요
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

        {selectedChild && growthRecords.length > 0 && (
          <>
            {/* Metric Selector */}
            <View style={styles.metricSelector}>
              <TouchableOpacity
                style={[
                  styles.metricButton,
                  styles.metricButtonFirst,
                  selectedMetric === "height" && styles.metricButtonSelected,
                ]}
                onPress={() => setSelectedMetric("height")}
              >
                <Text
                  style={[
                    styles.metricButtonText,
                    selectedMetric === "height" && styles.metricButtonTextSelected,
                  ]}
                >
                  키
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.metricButton,
                  styles.metricButtonMiddle,
                  selectedMetric === "weight" && styles.metricButtonSelected,
                ]}
                onPress={() => setSelectedMetric("weight")}
              >
                <Text
                  style={[
                    styles.metricButtonText,
                    selectedMetric === "weight" && styles.metricButtonTextSelected,
                  ]}
                >
                  몸무게
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.metricButton,
                  styles.metricButtonLast,
                  selectedMetric === "head" && styles.metricButtonSelected,
                ]}
                onPress={() => setSelectedMetric("head")}
              >
                <Text
                  style={[
                    styles.metricButtonText,
                    selectedMetric === "head" && styles.metricButtonTextSelected,
                  ]}
                >
                  머리둘레
                </Text>
              </TouchableOpacity>
            </View>

            {/* Growth Chart */}
            {renderGrowthChart()}
          </>
        )}

        {/* Growth Records */}
        {isLoading ? (
          <Text style={styles.emptyText}>로딩 중...</Text>
        ) : growthRecords.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              아직 기록된 성장 데이터가 없습니다.{"\n"}
              첫 번째 성장 기록을 추가해보세요!
            </Text>
            <Button
              title="첫 성장 기록 추가"
              onPress={() => navigation.navigate("AddGrowthRecord", { childId: selectedChild })}
            />
          </View>
        ) : (
          <View style={styles.recordsSection}>
            <Text style={styles.sectionTitle}>
              성장 기록 ({growthRecords.length}개)
            </Text>
            {growthRecords.map(renderRecordCard)}
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      {selectedChild && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate("AddGrowthRecord", { childId: selectedChild })}
        >
          <Text style={styles.fabText}>📏</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}