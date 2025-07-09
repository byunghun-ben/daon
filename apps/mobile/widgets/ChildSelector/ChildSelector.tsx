import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Image,
  Animated,
} from "react-native";
import { useActiveChild } from "../../shared/hooks/useActiveChild";
import { cn } from "../../shared/lib/utils/cn";
import type { ChildApi } from "@daon/shared";

interface ChildSelectorProps {
  onChildChange?: (child: ChildApi) => void;
}

const ChildSelector: React.FC<ChildSelectorProps> = ({ onChildChange }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(1));

  const {
    activeChild,
    availableChildren,
    hasMultipleChildren,
    switchChild,
    isLoading,
  } = useActiveChild();

  const handleChildPress = () => {
    if (hasMultipleChildren) {
      // 터치 애니메이션
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();

      setIsModalVisible(true);
    }
  };

  const handleChildSelect = (child: ChildApi) => {
    switchChild(child.id);
    setIsModalVisible(false);
    onChildChange?.(child);
  };

  const renderChildAvatar = (child: ChildApi, size: number = 32) => (
    <View className="rounded-2xl mr-2" style={{ width: size, height: size }}>
      {child.photoUrl ? (
        <Image
          source={{ uri: child.photoUrl }}
          className="rounded-2xl"
          style={{
            width: size,
            height: size,
          }}
        />
      ) : (
        <View className="bg-primary rounded-2xl justify-center items-center" style={{ width: size, height: size }}>
          <Text className="text-white font-semibold" style={{ fontSize: size * 0.4 }}>
            {child.name.charAt(0).toUpperCase()}
          </Text>
        </View>
      )}
    </View>
  );

  const renderChildItem = (child: ChildApi, isActive: boolean = false) => (
    <TouchableOpacity
      key={child.id}
      className={cn(
        "flex-row items-center p-4 border-b border-border",
        isActive && "bg-surface"
      )}
      onPress={() => handleChildSelect(child)}
    >
      {renderChildAvatar(child, 40)}
      <View className="flex-1">
        <Text className={cn(
          "text-sm font-medium text-muted-foreground",
          isActive && "text-base text-foreground font-semibold"
        )}>
          {child.name}
        </Text>
        <Text className="text-xs text-muted-foreground mt-0.5">{calculateAge(child.birthDate)}</Text>
      </View>
      {isActive && (
        <View className="w-6 h-6 rounded-full bg-primary justify-center items-center">
          <Text className="text-white text-sm font-semibold">✓</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  if (isLoading || !activeChild) {
    return (
      <View className="flex-row items-center">
        <View className="flex-row items-center py-2 px-3">
          <View className="w-8 h-8 rounded-2xl bg-border mr-2" />
          <View className="w-20 h-4 rounded bg-border" />
        </View>
      </View>
    );
  }

  return (
    <>
      <Animated.View
        className="flex-row items-center"
        style={{ transform: [{ scale: scaleAnim }] }}
      >
        <TouchableOpacity
          className="flex-row items-center py-2 px-3 bg-surface rounded-3xl border border-border"
          onPress={handleChildPress}
          disabled={!hasMultipleChildren}
        >
          {renderChildAvatar(activeChild)}
          <View className="flex-1">
            <Text className="text-base font-semibold text-foreground">{activeChild.name}</Text>
            {hasMultipleChildren && (
              <Text className="text-xs text-muted-foreground mt-0.5">탭하여 전환</Text>
            )}
          </View>
          {hasMultipleChildren && <Text className="text-xs text-muted-foreground ml-2">▼</Text>}
        </TouchableOpacity>
      </Animated.View>

      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/50 justify-center items-center"
          activeOpacity={1}
          onPress={() => setIsModalVisible(false)}
        >
          <View className="bg-surface rounded-2xl w-4/5 max-h-3/5 overflow-hidden">
            <View className="flex-row justify-between items-center p-4 border-b border-border">
              <Text className="text-lg font-semibold text-foreground">아이 선택</Text>
              <TouchableOpacity
                className="w-8 h-8 rounded-2xl bg-background justify-center items-center"
                onPress={() => setIsModalVisible(false)}
              >
                <Text className="text-xl text-muted-foreground font-light">×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView className="max-h-72">
              {availableChildren.map((child) =>
                renderChildItem(child, child.id === activeChild.id),
              )}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

// 나이 계산 헬퍼 함수
const calculateAge = (birthDate: string): string => {
  const birth = new Date(birthDate);
  const today = new Date();
  const diffMonths =
    (today.getFullYear() - birth.getFullYear()) * 12 +
    (today.getMonth() - birth.getMonth());

  if (diffMonths < 12) {
    return `${diffMonths}개월`;
  } else {
    const years = Math.floor(diffMonths / 12);
    const months = diffMonths % 12;
    return months > 0 ? `${years}세 ${months}개월` : `${years}세`;
  }
};


export default ChildSelector;
