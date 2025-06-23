import React from "react";
import { View, Text } from "react-native";
import { useThemedStyles } from "../../shared/lib/hooks/useTheme";
import { Button } from "../../shared/ui";

interface ChildOnboardingScreenProps {
  navigation: any;
  onComplete: () => void;
}

export const ChildOnboardingScreen = ({
  navigation,
  onComplete,
}: ChildOnboardingScreenProps) => {
  const handleCreateChild = () => {
    navigation.navigate("ChildProfile", { 
      isFirstChild: true,
      onComplete 
    });
  };

  const handleJoinExistingChild = () => {
    navigation.navigate("JoinChild", { 
      onComplete 
    });
  };

  const styles = useThemedStyles((theme) => ({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      padding: theme.spacing.lg,
      justifyContent: "center" as const,
      alignItems: "center" as const,
    },
    content: {
      alignItems: "center" as const,
      marginBottom: theme.spacing.xl,
    },
    icon: {
      fontSize: 72,
      marginBottom: theme.spacing.lg,
    },
    title: {
      marginBottom: theme.spacing.md,
      textAlign: "center" as const,
    },
    description: {
      textAlign: "center" as const,
      marginBottom: theme.spacing.xl,
      color: theme.colors.text.secondary,
      lineHeight: 24,
    },
    buttonContainer: {
      width: "100%" as const,
      gap: theme.spacing.md,
    },
  }));

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.icon}>
          👶
        </Text>
        <Text style={styles.title}>
          아이 등록하기
        </Text>
        <Text style={styles.description}>
          다온에서 아이의 소중한 순간들을{"\n"}
          기록해보세요.{"\n\n"}
          새로운 아이를 등록하거나{"\n"}
          기존 아이 프로필에 참여할 수 있어요.
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="새 아이 등록하기"
          onPress={handleCreateChild}
        />
        <Button
          title="기존 아이 참여하기"
          variant="secondary"
          onPress={handleJoinExistingChild}
        />
      </View>
    </View>
  );
};