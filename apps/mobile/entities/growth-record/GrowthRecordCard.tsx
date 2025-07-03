import { type GrowthRecordApi } from "@daon/shared";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useThemedStyles } from "../../shared/lib/hooks/useTheme";
import Card from "../../shared/ui/Card";

interface GrowthRecordCardProps {
  growthRecord: GrowthRecordApi;
  onPress?: (growthRecord: GrowthRecordApi) => void;
  showUser?: boolean;
  showAge?: boolean;
}

export const GrowthRecordCard: React.FC<GrowthRecordCardProps> = ({
  growthRecord,
  onPress,
  showUser = true,
  showAge = true,
}) => {
  const styles = useThemedStyles((theme) => ({
    container: {
      marginBottom: theme.spacing.sm,
    },
    header: {
      flexDirection: "row" as const,
      justifyContent: "space-between" as const,
      alignItems: "center" as const,
      marginBottom: theme.spacing.md,
    },
    date: {
      fontSize: theme.typography.body1.fontSize,
      fontWeight: "600" as const,
      color: theme.colors.text,
    },
    age: {
      fontSize: theme.typography.body2.fontSize,
      color: theme.colors.textSecondary,
    },
    measurements: {
      flexDirection: "row" as const,
      justifyContent: "space-around" as const,
      marginBottom: theme.spacing.sm,
    },
    measurementItem: {
      alignItems: "center" as const,
      flex: 1,
    },
    measurementValue: {
      fontSize: theme.typography.h3.fontSize,
      fontWeight: "bold" as const,
      color: theme.colors.primary,
      marginBottom: theme.spacing.xs,
    },
    measurementLabel: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.textSecondary,
      textAlign: "center" as const,
    },
    measurementUnit: {
      fontSize: theme.typography.body2.fontSize,
      color: theme.colors.textSecondary,
    },
    separator: {
      width: 1,
      backgroundColor: theme.colors.border,
      marginHorizontal: theme.spacing.sm,
    },
    notes: {
      fontSize: theme.typography.body2.fontSize,
      color: theme.colors.textSecondary,
      fontStyle: "italic" as const,
      marginTop: theme.spacing.sm,
      paddingTop: theme.spacing.sm,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    userInfo: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.sm,
    },
  }));

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const calculateAge = (recordDate: string, birthDate?: string) => {
    if (!birthDate) return null;

    const record = new Date(recordDate);
    const birth = new Date(birthDate);
    const diffTime = record.getTime() - birth.getTime();
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

  const handlePress = () => {
    onPress?.(growthRecord);
  };

  // Age calculation disabled until child data is included in API response
  const age = null;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <Card>
        <View style={styles.header}>
          <View>
            <Text style={styles.date}>
              {formatDate(growthRecord.recordedAt)}
            </Text>
            {age && <Text style={styles.age}>({age})</Text>}
          </View>
        </View>

        <View style={styles.measurements}>
          {growthRecord.weight && (
            <>
              <View style={styles.measurementItem}>
                <Text style={styles.measurementValue}>
                  {growthRecord.weight}
                  <Text style={styles.measurementUnit}>kg</Text>
                </Text>
                <Text style={styles.measurementLabel}>체중</Text>
              </View>
              {(growthRecord.height || growthRecord.headCircumference) && (
                <View style={styles.separator} />
              )}
            </>
          )}

          {growthRecord.height && (
            <>
              <View style={styles.measurementItem}>
                <Text style={styles.measurementValue}>
                  {growthRecord.height}
                  <Text style={styles.measurementUnit}>cm</Text>
                </Text>
                <Text style={styles.measurementLabel}>신장</Text>
              </View>
              {growthRecord.headCircumference && (
                <View style={styles.separator} />
              )}
            </>
          )}

          {growthRecord.headCircumference && (
            <View style={styles.measurementItem}>
              <Text style={styles.measurementValue}>
                {growthRecord.headCircumference}
                <Text style={styles.measurementUnit}>cm</Text>
              </Text>
              <Text style={styles.measurementLabel}>머리둘레</Text>
            </View>
          )}
        </View>

        {growthRecord.notes && (
          <Text style={styles.notes}>"{growthRecord.notes}"</Text>
        )}

        {showUser && growthRecord.user && (
          <Text style={styles.userInfo}>
            기록자: {growthRecord.user.name || growthRecord.user.email}
          </Text>
        )}
      </Card>
    </TouchableOpacity>
  );
};
