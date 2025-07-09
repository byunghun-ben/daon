import React from "react";
import { View } from "react-native";

interface QuickActionsProps {
  activeChildId: string;
  onActivityComplete?: () => void;
}

// This component is not currently used in the app
// The quick actions are implemented directly in the home screen
const QuickActions: React.FC<QuickActionsProps> = () => {
  return <View />;
};

export default React.memo(QuickActions);
