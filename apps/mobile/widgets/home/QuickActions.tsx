import React, { useState } from "react";
import { View } from "react-native";
import { useThemedStyles } from "../../shared/lib/hooks/useTheme";
import Button from "../../shared/ui/Button";
import BottomSheet from "../../shared/ui/BottomSheet";
import { QuickActivityRecord } from "../quick-record";
import type { ActivityType } from "@daon/shared";

interface QuickActionsProps {
  activeChildId: string;
  onActivityComplete?: () => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({
  activeChildId,
  onActivityComplete,
}) => {
  const [selectedActivity, setSelectedActivity] = useState<ActivityType | null>(
    null,
  );
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);
  const styles = useThemedStyles((theme) => ({
    container: {
      flexDirection: "row" as const,
      justifyContent: "space-between" as const,
      marginBottom: theme.spacing.xl,
    },
    actionButton: {
      flex: 1,
      marginHorizontal: theme.spacing.xs,
    },
  }));

  const handleActivityPress = (activityType: ActivityType) => {
    setSelectedActivity(activityType);
    setIsBottomSheetVisible(true);
  };

  const handleActivitySuccess = () => {
    setIsBottomSheetVisible(false);
    setSelectedActivity(null);
    onActivityComplete?.();
  };

  const handleBottomSheetClose = () => {
    setIsBottomSheetVisible(false);
    setSelectedActivity(null);
  };

  const getActivityTitle = (activityType: ActivityType): string => {
    const titleMap = {
      feeding: "수유 기록",
      diaper: "기저귀 교체",
      sleep: "수면 기록",
      tummy_time: "배밀이 기록",
      custom: "사용자 정의",
    };
    return titleMap[activityType] || activityType;
  };

  const quickActionButtons = [
    {
      title: "수유 기록",
      activityType: "feeding" as const,
      variant: "primary" as const,
    },
    {
      title: "기저귀 교체",
      activityType: "diaper" as const,
      variant: "secondary" as const,
    },
    {
      title: "수면 기록",
      activityType: "sleep" as const,
      variant: "outline" as const,
    },
  ];

  return (
    <>
      <View style={styles.container}>
        {quickActionButtons.map((action) => (
          <Button
            key={action.activityType}
            title={action.title}
            size="small"
            variant={action.variant}
            buttonStyle={styles.actionButton}
            onPress={() => handleActivityPress(action.activityType)}
          />
        ))}
      </View>

      <BottomSheet
        visible={isBottomSheetVisible}
        onClose={handleBottomSheetClose}
        title={selectedActivity ? getActivityTitle(selectedActivity) : ""}
      >
        {selectedActivity && (
          <QuickActivityRecord
            activityType={selectedActivity}
            childId={activeChildId}
            onSuccess={handleActivitySuccess}
            onCancel={handleBottomSheetClose}
          />
        )}
      </BottomSheet>
    </>
  );
};

export default QuickActions;
