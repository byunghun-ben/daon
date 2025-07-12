import Card from "@/shared/ui/Card/Card";
import { type DiaryEntryApi, type ChildApi } from "@daon/shared";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

interface DiaryEntryCardProps {
  diaryEntry: DiaryEntryApi;
  onPress?: (diaryEntry: DiaryEntryApi) => void;
  showUser?: boolean;
  showChild?: boolean;
  childList?: ChildApi[];
  maxContentLength?: number;
}

export const DiaryEntryCard: React.FC<DiaryEntryCardProps> = ({
  diaryEntry,
  onPress,
  showUser = true,
  showChild = false,
  childList,
  maxContentLength = 100,
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const truncateContent = (content: string, maxLength: number) => {
    if (content.length <= maxLength) return content;
    return `${content.substring(0, maxLength)}...`;
  };

  const handlePress = () => {
    onPress?.(diaryEntry);
  };

  const getChildName = (childId: string): string | null => {
    if (!childList) return null;
    const child = childList.find((c) => c.id === childId);
    return child?.name || null;
  };

  const isContentTruncated = diaryEntry.content.length > maxContentLength;

  return (
    <TouchableOpacity
      className="mb-4"
      onPress={handlePress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <Card>
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-row items-center flex-1">
            <Text className="text-sm text-text-secondary font-semibold">
              {formatDate(diaryEntry.date)}
            </Text>

            {showChild &&
              childList &&
              childList.length > 1 &&
              getChildName(diaryEntry.childId) && (
                <View className="bg-primary px-2 py-1 rounded ml-2">
                  <Text className="text-white text-xs font-semibold">
                    {getChildName(diaryEntry.childId)}
                  </Text>
                </View>
              )}
          </View>

          {diaryEntry.milestones && diaryEntry.milestones.length > 0 && (
            <View className="flex-row flex-wrap gap-1 ml-2">
              {diaryEntry.milestones.slice(0, 2).map((milestone) => (
                <View
                  key={milestone.id}
                  className="bg-primary/20 px-2 py-1 rounded"
                >
                  <Text className="text-primary text-xs font-semibold">
                    {milestone.description}
                  </Text>
                </View>
              ))}
              {diaryEntry.milestones.length > 2 && (
                <View className="bg-primary/20 px-2 py-1 rounded">
                  <Text className="text-primary text-xs font-semibold">
                    +{diaryEntry.milestones.length - 2}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        <Text className="text-base text-text leading-6 mb-3">
          {truncateContent(diaryEntry.content, maxContentLength)}
          {isContentTruncated && onPress && (
            <Text className="text-sm text-primary font-medium"> 더보기</Text>
          )}
        </Text>

        {diaryEntry.photos && diaryEntry.photos.length > 0 && (
          <View className="flex-row gap-1 mb-3">
            {diaryEntry.photos.slice(0, 3).map((photo, index) => (
              <Image
                key={index}
                source={{ uri: photo }}
                className="w-15 h-15 rounded"
              />
            ))}
            {diaryEntry.photos.length > 3 && (
              <Text className="text-xs text-text-secondary self-center ml-2">
                +{diaryEntry.photos.length - 3}개 더
              </Text>
            )}
          </View>
        )}

        {showUser && diaryEntry.user && (
          <Text className="text-xs text-text-secondary mt-3">
            작성자: {diaryEntry.user.name || diaryEntry.user.email}
          </Text>
        )}
      </Card>
    </TouchableOpacity>
  );
};
