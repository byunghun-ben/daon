import { type DiaryEntryApi } from "@daon/shared";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { useThemedStyles } from "../../shared/lib/hooks/useTheme";
import Card from "../../shared/ui/Card";

interface DiaryEntryCardProps {
  diaryEntry: DiaryEntryApi;
  onPress?: (diaryEntry: DiaryEntryApi) => void;
  showUser?: boolean;
  maxContentLength?: number;
}

export const DiaryEntryCard: React.FC<DiaryEntryCardProps> = ({
  diaryEntry,
  onPress,
  showUser = true,
  maxContentLength = 100,
}) => {
  const styles = useThemedStyles((theme) => ({
    container: {
      marginBottom: theme.spacing.md,
    },
    header: {
      flexDirection: "row" as const,
      justifyContent: "space-between" as const,
      alignItems: "flex-start" as const,
      marginBottom: theme.spacing.sm,
    },
    date: {
      fontSize: theme.typography.body2.fontSize,
      color: theme.colors.textSecondary,
      fontWeight: "600" as const,
    },
    milestonesContainer: {
      flexDirection: "row" as const,
      flexWrap: "wrap" as const,
      gap: theme.spacing.xs,
    },
    milestoneTag: {
      backgroundColor: theme.colors.primary + "20",
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.sm,
    },
    milestoneText: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.primary,
      fontWeight: "600" as const,
    },
    content: {
      fontSize: theme.typography.body1.fontSize,
      color: theme.colors.text,
      lineHeight: theme.typography.body1.lineHeight,
      marginBottom: theme.spacing.sm,
    },
    photosContainer: {
      flexDirection: "row" as const,
      gap: theme.spacing.xs,
      marginBottom: theme.spacing.sm,
    },
    photo: {
      width: 60,
      height: 60,
      borderRadius: theme.borderRadius.sm,
    },
    photoCount: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.textSecondary,
      alignSelf: "center" as const,
    },
    userInfo: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.sm,
    },
    readMore: {
      fontSize: theme.typography.body2.fontSize,
      color: theme.colors.primary,
      fontWeight: "500" as const,
    },
  }));

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const truncateContent = (content: string, maxLength: number) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  const handlePress = () => {
    onPress?.(diaryEntry);
  };

  const isContentTruncated = diaryEntry.content.length > maxContentLength;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <Card>
        <View style={styles.header}>
          <Text style={styles.date}>{formatDate(diaryEntry.date)}</Text>

          {diaryEntry.milestones && diaryEntry.milestones.length > 0 && (
            <View style={styles.milestonesContainer}>
              {diaryEntry.milestones.slice(0, 2).map((milestone) => (
                <View key={milestone.id} style={styles.milestoneTag}>
                  <Text style={styles.milestoneText}>{milestone.title}</Text>
                </View>
              ))}
              {diaryEntry.milestones.length > 2 && (
                <View style={styles.milestoneTag}>
                  <Text style={styles.milestoneText}>
                    +{diaryEntry.milestones.length - 2}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        <Text style={styles.content}>
          {truncateContent(diaryEntry.content, maxContentLength)}
          {isContentTruncated && onPress && (
            <Text style={styles.readMore}> 더보기</Text>
          )}
        </Text>

        {diaryEntry.photos && diaryEntry.photos.length > 0 && (
          <View style={styles.photosContainer}>
            {diaryEntry.photos.slice(0, 3).map((photo, index) => (
              <Image key={index} source={{ uri: photo }} style={styles.photo} />
            ))}
            {diaryEntry.photos.length > 3 && (
              <Text style={styles.photoCount}>
                +{diaryEntry.photos.length - 3}개 더
              </Text>
            )}
          </View>
        )}

        {showUser && diaryEntry.user && (
          <Text style={styles.userInfo}>
            작성자: {diaryEntry.user.name || diaryEntry.user.email}
          </Text>
        )}
      </Card>
    </TouchableOpacity>
  );
};
