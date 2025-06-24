import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useThemedStyles } from "../../shared/lib/hooks/useTheme";
import { CreateChildForm } from "./CreateChildForm";
import { JoinChildForm } from "./JoinChildForm";

type TabType = "create" | "join";

interface ChildRegistrationWidgetProps {
  onSuccess?: (childData: any) => void;
  onError?: (error: any) => void;
  loading?: boolean;
  initialTab?: TabType;
}

export const ChildRegistrationWidget = ({
  onSuccess,
  onError,
  loading = false,
  initialTab = "create",
}: ChildRegistrationWidgetProps) => {
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);

  const styles = useThemedStyles((theme) => ({
    container: {
      flex: 1,
    },
    tabContainer: {
      flexDirection: "row" as const,
      backgroundColor: theme.colors.surface,
      marginHorizontal: theme.spacing.lg,
      marginTop: theme.spacing.lg,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.xs,
    },
    tab: {
      flex: 1,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.borderRadius.sm,
      alignItems: "center" as const,
    },
    activeTab: {
      backgroundColor: theme.colors.background,
      shadowColor: theme.shadows.sm.shadowColor,
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    inactiveTab: {
      backgroundColor: "transparent",
    },
    tabText: {
      fontSize: theme.typography.body1.fontSize,
      fontWeight: "600" as const,
    },
    activeTabText: {
      color: theme.colors.primary,
    },
    inactiveTabText: {
      color: theme.colors.text.secondary,
    },
    formContainer: {
      flex: 1,
      marginTop: theme.spacing.sm,
    },
  }));

  const handleTabPress = (tab: TabType) => {
    setActiveTab(tab);
  };

  return (
    <View style={styles.container}>
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "create" ? styles.activeTab : styles.inactiveTab,
          ]}
          onPress={() => handleTabPress("create")}
          disabled={loading}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "create"
                ? styles.activeTabText
                : styles.inactiveTabText,
            ]}
          >
            새 아이 등록
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "join" ? styles.activeTab : styles.inactiveTab,
          ]}
          onPress={() => handleTabPress("join")}
          disabled={loading}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "join"
                ? styles.activeTabText
                : styles.inactiveTabText,
            ]}
          >
            기존 아이 참여
          </Text>
        </TouchableOpacity>
      </View>

      {/* Form Content */}
      <View style={styles.formContainer}>
        {activeTab === "create" ? (
          <CreateChildForm
            onSuccess={onSuccess}
            onError={onError}
            loading={loading}
            title="아이 프로필 만들기"
            subtitle="소중한 아이의 정보를 입력해주세요"
          />
        ) : (
          <JoinChildForm
            onSuccess={onSuccess}
            onError={onError}
            loading={loading}
            title="기존 아이 참여하기"
            subtitle="다른 보호자로부터 받은 초대 코드를 입력해주세요"
          />
        )}
      </View>
    </View>
  );
};
