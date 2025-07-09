import { IconSymbol } from "@/components/ui/IconSymbol.ios";
import {
  useCreateSubscription,
  useStartTrial,
  useSubscriptionPlans,
} from "@/shared/api/subscription/hooks";
import { useThemedStyles } from "@/shared/lib/hooks/useTheme";
import { useIsActive, useIsPremium } from "@/shared/store/subscription.store";
import Button from "@/shared/ui/Button/Button";
import Card from "@/shared/ui/Card/Card";
import type { SubscriptionPlan } from "@daon/shared";
import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type BillingInterval = "month" | "year";

export default function SubscriptionPlansScreen() {
  const router = useRouter();
  const [selectedInterval, setSelectedInterval] =
    useState<BillingInterval>("year");
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const styles = useThemedStyles((theme) => ({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      padding: theme.spacing.lg,
    },
    header: {
      alignItems: "center" as const,
      marginBottom: theme.spacing.xl,
    },
    title: {
      fontSize: theme.typography.title.fontSize,
      fontWeight: theme.typography.title.fontWeight,
      color: theme.colors.text,
      textAlign: "center" as const,
      marginBottom: theme.spacing.sm,
    },
    subtitle: {
      fontSize: theme.typography.body2.fontSize,
      color: theme.colors.textSecondary,
      textAlign: "center" as const,
      lineHeight: 20,
    },
    intervalSelector: {
      flexDirection: "row" as const,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: 4,
      marginBottom: theme.spacing.xl,
    },
    intervalButton: {
      flex: 1,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      alignItems: "center" as const,
    },
    intervalButtonActive: {
      backgroundColor: theme.colors.primary,
    },
    intervalText: {
      fontSize: theme.typography.body2.fontSize,
      fontWeight: "600" as const,
      color: theme.colors.textSecondary,
    },
    intervalTextActive: {
      color: theme.colors.onPrimary,
    },
    savingsBadge: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.primary,
      fontWeight: "600" as const,
      marginTop: 2,
    },
    planCard: {
      marginBottom: theme.spacing.lg,
      borderWidth: 2,
      borderColor: "transparent",
    },
    planCardSelected: {
      borderColor: theme.colors.primary,
    },
    planCardPopular: {
      borderColor: theme.colors.primary,
      position: "relative" as const,
    },
    popularBadge: {
      position: "absolute" as const,
      top: -12,
      left: theme.spacing.lg,
      backgroundColor: theme.colors.primary,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.sm,
    },
    popularText: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.onPrimary,
      fontWeight: "600" as const,
    },
    planHeader: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      marginBottom: theme.spacing.md,
    },
    planIcon: {
      marginRight: theme.spacing.sm,
    },
    planName: {
      fontSize: theme.typography.h3.fontSize,
      fontWeight: theme.typography.h3.fontWeight,
      color: theme.colors.text,
      flex: 1,
    },
    priceContainer: {
      alignItems: "center" as const,
      marginBottom: theme.spacing.lg,
    },
    price: {
      fontSize: 32,
      fontWeight: "bold" as const,
      color: theme.colors.primary,
    },
    priceSubtext: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.xs,
    },
    originalPrice: {
      fontSize: theme.typography.body2.fontSize,
      color: theme.colors.textMuted,
      textDecorationLine: "line-through" as const,
      marginTop: theme.spacing.xs,
    },
    featuresContainer: {
      marginBottom: theme.spacing.lg,
    },
    feature: {
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
    planButton: {
      marginTop: theme.spacing.md,
    },
    trialInfo: {
      backgroundColor: `${theme.colors.info}20`,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      marginBottom: theme.spacing.lg,
    },
    trialText: {
      fontSize: theme.typography.body2.fontSize,
      color: theme.colors.info,
      textAlign: "center" as const,
      fontWeight: "600" as const,
    },
    footer: {
      alignItems: "center" as const,
      marginTop: theme.spacing.xl,
      paddingTop: theme.spacing.lg,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    footerText: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.textMuted,
      textAlign: "center" as const,
      lineHeight: 16,
      marginBottom: theme.spacing.sm,
    },
    restoreButton: {
      marginTop: theme.spacing.md,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center" as const,
      alignItems: "center" as const,
    },
    errorContainer: {
      flex: 1,
      justifyContent: "center" as const,
      alignItems: "center" as const,
      padding: theme.spacing.lg,
    },
    errorText: {
      fontSize: theme.typography.body1.fontSize,
      color: theme.colors.error,
      textAlign: "center" as const,
      marginBottom: theme.spacing.lg,
    },
  }));

  const { data: plansData, isLoading, error, refetch } = useSubscriptionPlans();
  const createSubscription = useCreateSubscription();
  const startTrial = useStartTrial();
  const isPremium = useIsPremium();
  const isActive = useIsActive();

  const handleIntervalChange = (interval: BillingInterval) => {
    setSelectedInterval(interval);
  };

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
  };

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    try {
      if (plan.name === "free") {
        // Handle free plan selection
        router.back();
        return;
      }

      Alert.alert(
        "구독 확인",
        `${plan.name} 플랜을 구독하시겠습니까?\n${selectedInterval === "year" ? "연간" : "월간"} ${plan.price.toLocaleString()}원`,
        [
          { text: "취소", style: "cancel" },
          {
            text: "구독하기",
            onPress: async () => {
              await createSubscription.mutateAsync({
                planId: plan.id,
                trialDays: 7, // 7일 무료 체험
              });

              Alert.alert("구독 완료", "구독이 성공적으로 완료되었습니다!", [
                { text: "확인", onPress: () => router.back() },
              ]);
            },
          },
        ],
      );
    } catch {
      Alert.alert("오류", "구독 처리 중 오류가 발생했습니다.");
    }
  };

  const handleStartTrial = async (planId: string) => {
    try {
      await startTrial.mutateAsync(planId);
      Alert.alert("체험 시작", "7일 무료 체험이 시작되었습니다!", [
        { text: "확인", onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert("오류", "체험 시작 중 오류가 발생했습니다.");
    }
  };

  const getDisplayPrice = (plan: SubscriptionPlan) => {
    if (plan.name === "free") return "무료";

    const price =
      selectedInterval === "year" ? plan.price * 12 * 0.8 : plan.price; // 20% 연간 할인
    return `₩${price.toLocaleString()}`;
  };

  const getPriceSubtext = (plan: SubscriptionPlan) => {
    if (plan.name === "free") return "영구 무료";

    return selectedInterval === "year" ? "/년" : "/월";
  };

  const getOriginalPrice = (plan: SubscriptionPlan) => {
    if (plan.name === "free" || selectedInterval === "month") return null;

    return `₩${(plan.price * 12).toLocaleString()}/년`;
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: "구독 플랜" }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={{ marginTop: 16, color: "#666" }}>
            플랜을 불러오는 중...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: "구독 플랜" }} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            플랜을 불러오는 중 오류가 발생했습니다.
          </Text>
          <Button title="다시 시도" onPress={() => refetch()} />
        </View>
      </SafeAreaView>
    );
  }

  const plans = plansData?.plans || [];

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: "구독 플랜",
          headerStyle: {
            backgroundColor: styles.container.backgroundColor,
          },
          headerTitleStyle: {
            color: styles.title.color,
          },
        }}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>다온 프리미엄</Text>
          <Text style={styles.subtitle}>
            아이의 성장을 더 자세히 기록하고 분석하세요
          </Text>
        </View>

        {/* Billing interval selector */}
        <View style={styles.intervalSelector}>
          <TouchableOpacity
            style={[
              styles.intervalButton,
              selectedInterval === "month" && styles.intervalButtonActive,
            ]}
            onPress={() => handleIntervalChange("month")}
          >
            <Text
              style={[
                styles.intervalText,
                selectedInterval === "month" && styles.intervalTextActive,
              ]}
            >
              월간
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.intervalButton,
              selectedInterval === "year" && styles.intervalButtonActive,
            ]}
            onPress={() => handleIntervalChange("year")}
          >
            <Text
              style={[
                styles.intervalText,
                selectedInterval === "year" && styles.intervalTextActive,
              ]}
            >
              연간
            </Text>
            {selectedInterval === "year" && (
              <Text style={styles.savingsBadge}>20% 절약</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Trial info */}
        <View style={styles.trialInfo}>
          <Text style={styles.trialText}>
            🎉 7일 무료 체험 후 언제든 취소 가능
          </Text>
        </View>

        {/* Plans list */}
        {plans.map((plan: SubscriptionPlan, _index: number) => (
          <TouchableOpacity
            key={plan.id}
            style={[
              styles.planCard,
              selectedPlan === plan.id && styles.planCardSelected,
              plan.name === "premium" && styles.planCardPopular,
            ]}
            onPress={() => handlePlanSelect(plan.id)}
            accessibilityRole="button"
            accessibilityLabel={`${plan.name} 플랜 선택`}
          >
            <Card>
              {plan.name === "premium" && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularText}>인기</Text>
                </View>
              )}

              <View style={styles.planHeader}>
                <View style={styles.planIcon}>
                  <IconSymbol
                    name={plan.name === "free" ? "heart" : "star.fill"}
                    size={24}
                    color={plan.name === "free" ? "#666" : "#FFD700"}
                  />
                </View>
                <Text style={styles.planName}>
                  {plan.name === "free"
                    ? "무료"
                    : plan.name === "premium"
                      ? "프리미엄"
                      : "패밀리"}
                </Text>
              </View>

              <View style={styles.priceContainer}>
                <Text style={styles.price}>{getDisplayPrice(plan)}</Text>
                <Text style={styles.priceSubtext}>{getPriceSubtext(plan)}</Text>
                {getOriginalPrice(plan) && (
                  <Text style={styles.originalPrice}>
                    {getOriginalPrice(plan)}
                  </Text>
                )}
              </View>

              <View style={styles.featuresContainer}>
                {plan.features.map((feature: string, featureIndex: number) => (
                  <View key={featureIndex} style={styles.feature}>
                    <IconSymbol
                      name="checkmark.circle.fill"
                      size={16}
                      color="#4CAF50"
                    />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>

              <Button
                title={
                  plan.name === "free"
                    ? "현재 플랜"
                    : isActive
                      ? "플랜 변경"
                      : "무료 체험 시작"
                }
                onPress={() => {
                  if (plan.name === "free") return;
                  if (isActive) {
                    handleSubscribe(plan);
                  } else {
                    handleStartTrial(plan.id);
                  }
                }}
                variant={plan.name === "premium" ? "primary" : "outline"}
                disabled={plan.name === "free" && !isPremium}
                loading={createSubscription.isPending || startTrial.isPending}
                style={styles.planButton}
              />
            </Card>
          </TouchableOpacity>
        ))}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            구독은 언제든지 취소할 수 있으며, 취소 시 현재 구독 기간이 끝날
            때까지 서비스를 이용할 수 있습니다.
          </Text>

          <TouchableOpacity
            style={styles.restoreButton}
            onPress={() => {
              // Handle restore purchases
              Alert.alert("구매 복원", "이전 구매를 복원하시겠습니까?");
            }}
          >
            <Text style={[styles.footerText, { color: "#4CAF50" }]}>
              구매 내역 복원
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 50 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
