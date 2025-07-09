import { type ChildApi } from "@daon/shared";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { cn } from "../../shared/lib/utils/cn";
import Card from "../../shared/ui/Card";

interface ChildCardProps {
  child: ChildApi;
  onPress?: (child: ChildApi) => void;
  isSelected?: boolean;
  showDetails?: boolean;
  className?: string;
}

export const ChildCard: React.FC<ChildCardProps> = ({
  child,
  onPress,
  isSelected = false,
  showDetails = true,
  className,
}) => {

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
      className={cn(
        "mb-sm",
        isSelected && "border-2 border-primary",
        className
      )}
      onPress={handlePress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <Card>
        <View className={cn("flex-row items-center", showDetails && "mb-sm")}>
          {child.photoUrl ? (
            <Image 
              source={{ uri: child.photoUrl }} 
              className="w-[60px] h-[60px] rounded-full bg-surface mr-md"
            />
          ) : (
            <View className="w-[60px] h-[60px] rounded-full bg-surface justify-center items-center mr-md">
              <Text className="text-[24px]">👶</Text>
            </View>
          )}

          <View className="flex-1">
            <Text className="text-subtitle mb-xs">{child.name}</Text>
            <Text className="text-sm text-text-secondary">{calculateAge(child.birthDate)}</Text>
          </View>
        </View>

        {showDetails && (
          <View className="pt-sm border-t border-border">
            <View className="flex-row justify-between mb-xs">
              <Text className="text-sm text-text-secondary">생년월일</Text>
              <Text className="text-sm text-text font-medium">
                {formatDate(child.birthDate)}
              </Text>
            </View>

            <View className="flex-row justify-between mb-xs">
              <Text className="text-sm text-text-secondary">성별</Text>
              <Text className="text-sm text-text font-medium">
                {getGenderText(child.gender)}
              </Text>
            </View>

            {child.birthWeight && (
              <View className="flex-row justify-between mb-xs">
                <Text className="text-sm text-text-secondary">출생 체중</Text>
                <Text className="text-sm text-text font-medium">{child.birthWeight}kg</Text>
              </View>
            )}

            {child.birthHeight && (
              <View className="flex-row justify-between mb-xs">
                <Text className="text-sm text-text-secondary">출생 신장</Text>
                <Text className="text-sm text-text font-medium">{child.birthHeight}cm</Text>
              </View>
            )}
          </View>
        )}

        {isSelected && (
          <View className="absolute top-sm right-sm bg-primary rounded-xl w-6 h-6 justify-center items-center">
            <Text className="text-white text-base font-bold">✓</Text>
          </View>
        )}
      </Card>
    </TouchableOpacity>
  );
};
