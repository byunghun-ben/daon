import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { useThemedStyles } from "../../lib/hooks/useTheme";
import { useHasFeature, useCanUseFeature, useIsPremium } from "../../store/subscription.store";
import Button from "../Button";
import Card from "../Card";
import { IconSymbol } from "../../../components/ui/IconSymbol";

interface PremiumGateProps {
  feature: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showUpgrade?: boolean;
  usageRequired?: number;
  title?: string;
  description?: string;
  upgradeButtonText?: string;
}

export const PremiumGate: React.FC<PremiumGateProps> = ({
  feature,
  children,
  fallback,
  showUpgrade = true,
  usageRequired = 1,
  title,
  description,
  upgradeButtonText = "프리미엄으로 업그레이드",
}) => {
  const router = useRouter();
  const [showModal, setShowModal] = React.useState(false);
  
  const hasFeature = useHasFeature(feature);
  const canUseFeature = useCanUseFeature(feature, usageRequired);
  const isPremium = useIsPremium();

  const styles = useThemedStyles((theme) => ({
    container: {
      flex: 1,
    },
    restrictedContainer: {
      padding: theme.spacing.lg,
      alignItems: "center" as const,
      justifyContent: "center" as const,
      minHeight: 200,
    },
    icon: {
      marginBottom: theme.spacing.md,
    },
    title: {
      fontSize: theme.typography.h3.fontSize,
      fontWeight: theme.typography.h3.fontWeight,
      color: theme.colors.text,
      textAlign: "center" as const,
      marginBottom: theme.spacing.sm,
    },
    description: {
      fontSize: theme.typography.body2.fontSize,
      color: theme.colors.textSecondary,
      textAlign: "center" as const,
      lineHeight: 20,
      marginBottom: theme.spacing.lg,
    },
    upgradeButton: {
      minWidth: 200,
    },
    learnMoreButton: {
      marginTop: theme.spacing.md,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center" as const,
      alignItems: "center" as const,
      padding: theme.spacing.lg,
    },
    modalContent: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      maxWidth: 400,
      width: "100%" as const,
      maxHeight: "80%" as const,
    },
    modalTitle: {
      fontSize: theme.typography.title.fontSize,
      fontWeight: theme.typography.title.fontWeight,
      color: theme.colors.text,
      textAlign: "center" as const,
      marginBottom: theme.spacing.md,
    },
    modalDescription: {
      fontSize: theme.typography.body1.fontSize,
      color: theme.colors.textSecondary,
      textAlign: "center" as const,
      lineHeight: 22,
      marginBottom: theme.spacing.lg,
    },
    featureList: {
      marginBottom: theme.spacing.lg,
    },
    featureItem: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      marginBottom: theme.spacing.sm,
    },
    featureText: {
      fontSize: theme.typography.body2.fontSize,
      color: theme.colors.text,
      marginLeft: theme.spacing.sm,
      flex: 1,
    },
    buttonRow: {
      flexDirection: "row" as const,
      justifyContent: "space-between" as const,
      gap: theme.spacing.md,
    },
    modalButton: {
      flex: 1,
    },
  }));

  // If user has access to the feature, render children
  if (hasFeature && canUseFeature) {
    return <>{children}</>;
  }

  // Custom fallback
  if (fallback) {
    return <>{fallback}</>;
  }

  // Default premium gate UI
  const defaultTitle = title || getFeatureTitle(feature);
  const defaultDescription = description || getFeatureDescription(feature);

  const handleUpgrade = () => {
    setShowModal(false);
    router.push("/subscription/plans");
  };

  const handleLearnMore = () => {
    setShowModal(true);
  };

  return (
    <>
      <Card style={styles.restrictedContainer}>
        <View style={styles.icon}>
          <IconSymbol 
            name="star.fill" 
            size={48} 
            color="#FFD700" 
          />
        </View>
        
        <Text style={styles.title}>{defaultTitle}</Text>
        <Text style={styles.description}>{defaultDescription}</Text>

        {showUpgrade && (
          <>
            <Button
              title={upgradeButtonText}
              onPress={handleUpgrade}
              variant="primary"
              style={styles.upgradeButton}
              accessibilityLabel="프리미엄으로 업그레이드"
              accessibilityHint="프리미엄 기능을 사용하기 위해 구독을 시작합니다"
            />
            
            <TouchableOpacity
              style={styles.learnMoreButton}
              onPress={handleLearnMore}
              accessibilityRole="button"
              accessibilityLabel="자세히 알아보기"
              accessibilityHint="프리미엄 기능에 대한 자세한 정보를 확인합니다"
            >
              <Text style={[styles.description, { marginBottom: 0 }]}>
                자세히 알아보기
              </Text>
            </TouchableOpacity>
          </>
        )}
      </Card>

      {/* Premium features modal */}
      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowModal(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>프리미엄 기능</Text>
              <Text style={styles.modalDescription}>
                프리미엄 구독으로 더 많은 기능을 이용하세요
              </Text>

              <ScrollView style={styles.featureList} showsVerticalScrollIndicator={false}>
                {getPremiumFeatures().map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <IconSymbol 
                      name="checkmark.circle.fill" 
                      size={20} 
                      color="#4CAF50" 
                    />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </ScrollView>

              <View style={styles.buttonRow}>
                <Button
                  title="취소"
                  onPress={() => setShowModal(false)}
                  variant="outline"
                  style={styles.modalButton}
                />
                <Button
                  title="업그레이드"
                  onPress={handleUpgrade}
                  variant="primary"
                  style={styles.modalButton}
                />
              </View>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

// Helper functions for feature metadata
function getFeatureTitle(feature: string): string {
  const titles: Record<string, string> = {
    unlimited_children: "무제한 아이 등록",
    advanced_analytics: "고급 분석",
    ai_insights: "AI 인사이트",
    cloud_backup: "클라우드 백업",
    data_export: "데이터 내보내기",
    multiple_caregivers: "다중 보호자",
    priority_support: "우선 지원",
    custom_categories: "사용자 정의 카테고리",
    unlimited_photos: "무제한 사진",
    expert_consultation: "전문가 상담",
  };
  
  return titles[feature] || "프리미엄 기능";
}

function getFeatureDescription(feature: string): string {
  const descriptions: Record<string, string> = {
    unlimited_children: "여러 아이의 성장을 함께 관리하세요",
    advanced_analytics: "더 상세한 성장 패턴과 분석을 확인하세요",
    ai_insights: "AI가 제공하는 맞춤형 육아 팁을 받아보세요",
    cloud_backup: "데이터를 안전하게 클라우드에 백업하세요",
    data_export: "기록을 PDF나 CSV로 내보내세요",
    multiple_caregivers: "조부모, 육아도우미와 함께 기록을 관리하세요",
    priority_support: "빠른 고객 지원을 받으세요",
    custom_categories: "나만의 활동 카테고리를 만드세요",
    unlimited_photos: "사진을 무제한으로 업로드하세요",
    expert_consultation: "전문가와 상담을 받으세요",
  };
  
  return descriptions[feature] || "이 기능을 사용하려면 프리미엄 구독이 필요합니다";
}

function getPremiumFeatures(): string[] {
  return [
    "무제한 아이 등록",
    "고급 성장 분석 및 패턴 인사이트",
    "AI 기반 맞춤형 육아 팁",
    "클라우드 자동 백업",
    "데이터 내보내기 (PDF, CSV)",
    "다중 보호자 관리",
    "무제한 사진 업로드",
    "사용자 정의 활동 카테고리",
    "우선 고객 지원",
    "전문가 상담 연결",
  ];
}

export default PremiumGate;