import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Image,
  StyleSheet,
  Animated,
} from "react-native";
import { useActiveChild } from "../../shared/hooks/useActiveChild";
import { theme } from "../../shared/config/theme";
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
    <View style={[styles.avatar, { width: size, height: size }]}>
      {child.photoUrl ? (
        <Image
          source={{ uri: child.photoUrl }}
          style={{
            width: size,
            height: size,
            borderRadius: 16,
          }}
        />
      ) : (
        <View style={[styles.avatarPlaceholder, { width: size, height: size }]}>
          <Text style={[styles.avatarText, { fontSize: size * 0.4 }]}>
            {child.name.charAt(0).toUpperCase()}
          </Text>
        </View>
      )}
    </View>
  );

  const renderChildItem = (child: ChildApi, isActive: boolean = false) => (
    <TouchableOpacity
      key={child.id}
      style={[styles.childItem, isActive && styles.activeChildItem]}
      onPress={() => handleChildSelect(child)}
    >
      {renderChildAvatar(child, 40)}
      <View style={styles.childInfo}>
        <Text style={[styles.childName, isActive && styles.activeChildName]}>
          {child.name}
        </Text>
        <Text style={styles.childAge}>{calculateAge(child.birthDate)}</Text>
      </View>
      {isActive && (
        <View style={styles.activeIndicator}>
          <Text style={styles.checkmark}>✓</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  if (isLoading || !activeChild) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <View style={styles.skeletonAvatar} />
          <View style={styles.skeletonText} />
        </View>
      </View>
    );
  }

  return (
    <>
      <Animated.View
        style={[styles.container, { transform: [{ scale: scaleAnim }] }]}
      >
        <TouchableOpacity
          style={styles.selector}
          onPress={handleChildPress}
          disabled={!hasMultipleChildren}
        >
          {renderChildAvatar(activeChild)}
          <View style={styles.childInfo}>
            <Text style={styles.activeChildName}>{activeChild.name}</Text>
            {hasMultipleChildren && (
              <Text style={styles.switchHint}>탭하여 전환</Text>
            )}
          </View>
          {hasMultipleChildren && <Text style={styles.dropdownIcon}>▼</Text>}
        </TouchableOpacity>
      </Animated.View>

      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>아이 선택</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setIsModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.childList}>
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

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },

  selector: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  avatar: {
    borderRadius: 16,
    marginRight: 8,
  },

  avatarImage: {
    borderRadius: 16,
  },

  avatarPlaceholder: {
    backgroundColor: theme.colors.primary,
    borderRadius: 16,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },

  avatarText: {
    color: theme.colors.surface,
    fontWeight: "600",
  },

  childInfo: {
    flex: 1,
  },

  childName: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: "500",
  },

  activeChildName: {
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: "600",
  },

  childAge: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },

  switchHint: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },

  dropdownIcon: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginLeft: 8,
  },

  // 로딩 상태
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },

  skeletonAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.border,
    marginRight: 8,
  },

  skeletonText: {
    width: 80,
    height: 16,
    borderRadius: 8,
    backgroundColor: theme.colors.border,
  },

  // 모달 스타일
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalContent: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    width: "80%",
    maxHeight: "60%",
    overflow: "hidden",
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.text,
  },

  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.background,
    justifyContent: "center",
    alignItems: "center",
  },

  closeButtonText: {
    fontSize: 20,
    color: theme.colors.textSecondary,
    fontWeight: "300",
  },

  childList: {
    maxHeight: 300,
  },

  childItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },

  activeChildItem: {
    backgroundColor: theme.colors.surface,
  },

  activeIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },

  checkmark: {
    color: theme.colors.surface,
    fontSize: 14,
    fontWeight: "600",
  },
});

export default ChildSelector;
