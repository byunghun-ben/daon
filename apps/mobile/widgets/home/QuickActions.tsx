import type { ActivityType } from "@daon/shared";
import React, { useCallback, useMemo, useState } from "react";
import { View } from "react-native";
import BottomSheet from "../../shared/ui/BottomSheet";
import Button from "../../shared/ui/Button/Button";
import QuickActivityRecord from "../quick-record/QuickActivityRecord";

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

  const handleActivityPress = useCallback((activityType: ActivityType) => {
    setSelectedActivity(activityType);
    setIsBottomSheetVisible(true);
  }, []);

  const handleActivitySuccess = useCallback(() => {
    setIsBottomSheetVisible(false);
    setSelectedActivity(null);
    onActivityComplete?.();
  }, [onActivityComplete]);

  const handleBottomSheetClose = useCallback(() => {
    setIsBottomSheetVisible(false);
    setSelectedActivity(null);
  }, []);

  const titleMap = useMemo(
    () => ({
      feeding: "수유 기록",
      diaper: "기저귀 교체",
      sleep: "수면 기록",
      tummy_time: "배밀이 기록",
      custom: "사용자 정의",
    }),
    [],
  );

  const getActivityTitle = useCallback(
    (activityType: ActivityType): string => {
      return titleMap[activityType] || activityType;
    },
    [titleMap],
  );

  const quickActionButtons = useMemo(
    () => [
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
    ],
    [],
  );

  return (
    <>
      <View className="flex-row justify-between mb-xl">
        {quickActionButtons.map((action) => (
          <Button
            key={action.activityType}
            title={action.title}
            size="small"
            variant={action.variant}
            className="flex-1 mx-xs"
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

export default React.memo(QuickActions);
