import { type ChildApi } from "@daon/shared";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { useThemedStyles } from "../../shared/lib/hooks/useTheme";
import Card from "../../shared/ui/Card";

interface ChildCardProps {
  child: ChildApi;
  onPress?: (child: ChildApi) => void;
  isSelected?: boolean;
  showDetails?: boolean;
}

export const ChildCard: React.FC<ChildCardProps> = ({
  child,
  onPress,
  isSelected = false,
  showDetails = true,
}) => {
  const styles = useThemedStyles((theme) => ({
    container: {
      marginBottom: theme.spacing.sm,
    },
    selectedContainer: {
      borderWidth: 2,
      borderColor: theme.colors.primary,
    },
    header: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      marginBottom: showDetails ? theme.spacing.sm : 0,
    },
    photo: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: theme.colors.surface,
      marginRight: theme.spacing.md,
    },
    photoPlaceholder: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: theme.colors.surface,
      justifyContent: "center" as const,
      alignItems: "center" as const,
      marginRight: theme.spacing.md,
    },
    photoPlaceholderText: {
      fontSize: 24,
    },
    childInfo: {
      flex: 1,
    },
    childName: {
      fontSize: theme.typography.subtitle.fontSize,
      fontWeight: theme.typography.subtitle.fontWeight,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.xs,
    },
    childAge: {
      fontSize: theme.typography.body2.fontSize,
      color: theme.colors.text.secondary,
    },
    details: {
      paddingTop: theme.spacing.sm,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    detailRow: {
      flexDirection: "row" as const,
      justifyContent: "space-between" as const,
      marginBottom: theme.spacing.xs,
    },
    detailLabel: {
      fontSize: theme.typography.body2.fontSize,
      color: theme.colors.text.secondary,
    },
    detailValue: {
      fontSize: theme.typography.body2.fontSize,
      color: theme.colors.text.primary,
      fontWeight: "500" as const,
    },
    selectedIndicator: {
      position: "absolute" as const,
      top: theme.spacing.sm,
      right: theme.spacing.sm,
      backgroundColor: theme.colors.primary,
      borderRadius: 12,
      width: 24,
      height: 24,
      justifyContent: "center" as const,
      alignItems: "center" as const,
    },
    selectedIcon: {
      color: theme.colors.white,
      fontSize: 16,
      fontWeight: "bold" as const,
    },
  }));

  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate);
    const today = new Date();
    const diffTime = today.getTime() - birth.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 30) {
      return `${diffDays}일`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      const days = diffDays % 30;
      return days > 0 ? `${months}개월 ${days}일` : `${months}개월`;
    } else {
      const years = Math.floor(diffDays / 365);
      const remainingDays = diffDays % 365;
      const months = Math.floor(remainingDays / 30);

      if (months > 0) {
        return `${years}세 ${months}개월`;
      } else {
        return `${years}세`;
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getGenderText = (gender: string | null) => {
    if (!gender) return "미정";
    return gender === "male" ? "남아" : "여아";
  };

  const handlePress = () => {
    onPress?.(child);
  };

  return (
    <TouchableOpacity
      style={[styles.container, isSelected && styles.selectedContainer]}
      onPress={handlePress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <Card>
        <View style={styles.header}>
          {child.photoUrl ? (
            <Image source={{ uri: child.photoUrl }} style={styles.photo} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Text style={styles.photoPlaceholderText}>👶</Text>
            </View>
          )}

          <View style={styles.childInfo}>
            <Text style={styles.childName}>{child.name}</Text>
            <Text style={styles.childAge}>{calculateAge(child.birthDate)}</Text>
          </View>
        </View>

        {showDetails && (
          <View style={styles.details}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>생년월일</Text>
              <Text style={styles.detailValue}>
                {formatDate(child.birthDate)}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>성별</Text>
              <Text style={styles.detailValue}>
                {getGenderText(child.gender)}
              </Text>
            </View>

            {child.birthWeight && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>출생 체중</Text>
                <Text style={styles.detailValue}>{child.birthWeight}kg</Text>
              </View>
            )}

            {child.birthHeight && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>출생 신장</Text>
                <Text style={styles.detailValue}>{child.birthHeight}cm</Text>
              </View>
            )}
          </View>
        )}

        {isSelected && (
          <View style={styles.selectedIndicator}>
            <Text style={styles.selectedIcon}>✓</Text>
          </View>
        )}
      </Card>
    </TouchableOpacity>
  );
};
