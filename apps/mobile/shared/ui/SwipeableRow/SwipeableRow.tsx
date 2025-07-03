import React, { useRef } from "react";
import { Animated, Text, TouchableOpacity, View } from "react-native";
import type {
  PanGestureHandlerGestureEvent,
  PanGestureHandlerStateChangeEvent,
} from "react-native-gesture-handler";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import { IconSymbol } from "../../../components/ui/IconSymbol";
import { useThemedStyles } from "../../lib/hooks/useTheme";

export interface SwipeAction {
  label: string;
  icon: string;
  color: string;
  backgroundColor: string;
  onPress: () => void;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

interface SwipeableRowProps {
  children: React.ReactNode;
  leftActions?: SwipeAction[];
  rightActions?: SwipeAction[];
  onSwipeStart?: () => void;
  onSwipeEnd?: () => void;
}

const SWIPE_THRESHOLD = 80;
const ACTION_WIDTH = 80;

export const SwipeableRow: React.FC<SwipeableRowProps> = ({
  children,
  leftActions = [],
  rightActions = [],
  onSwipeStart,
  onSwipeEnd,
}) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const lastOffset = useRef(0);

  const styles = useThemedStyles((theme) => ({
    container: {
      overflow: "hidden" as const,
    },
    row: {
      backgroundColor: theme.colors.surface,
    },
    actionsContainer: {
      position: "absolute" as const,
      top: 0,
      bottom: 0,
      flexDirection: "row" as const,
      alignItems: "center" as const,
    },
    leftActions: {
      left: 0,
    },
    rightActions: {
      right: 0,
    },
    action: {
      width: ACTION_WIDTH,
      height: "100%" as const,
      justifyContent: "center" as const,
      alignItems: "center" as const,
      paddingHorizontal: theme.spacing.sm,
    },
    actionText: {
      fontSize: theme.typography.caption.fontSize,
      fontWeight: "600" as const,
      marginTop: theme.spacing.xs,
      textAlign: "center" as const,
    },
  }));

  const handleGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    {
      useNativeDriver: true,
      listener: (event: PanGestureHandlerGestureEvent) => {
        const { translationX } = event.nativeEvent;

        // Constrain swipe distance
        const maxLeftSwipe = leftActions.length * ACTION_WIDTH;
        const maxRightSwipe = rightActions.length * ACTION_WIDTH;

        const clampedTranslationX = Math.max(
          -maxRightSwipe,
          Math.min(maxLeftSwipe, translationX + lastOffset.current)
        );

        translateX.setValue(clampedTranslationX);
      },
    }
  );

  const handleStateChange = (event: PanGestureHandlerStateChangeEvent) => {
    const { state, translationX, velocityX } = event.nativeEvent;

    if (state === State.BEGAN) {
      onSwipeStart?.();
    } else if (state === State.END || state === State.CANCELLED) {
      const currentTranslateX = translationX + lastOffset.current;
      let finalPosition = 0;

      // Determine final position based on swipe distance and velocity
      if (
        Math.abs(currentTranslateX) > SWIPE_THRESHOLD ||
        Math.abs(velocityX) > 500
      ) {
        if (currentTranslateX > 0 && leftActions.length > 0) {
          // Swipe right - show left actions
          finalPosition = Math.min(
            leftActions.length * ACTION_WIDTH,
            currentTranslateX
          );
        } else if (currentTranslateX < 0 && rightActions.length > 0) {
          // Swipe left - show right actions
          finalPosition = Math.max(
            -rightActions.length * ACTION_WIDTH,
            currentTranslateX
          );
        }
      }

      lastOffset.current = finalPosition;

      Animated.spring(translateX, {
        toValue: finalPosition,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start(() => {
        onSwipeEnd?.();
      });
    }
  };

  const renderActions = (actions: SwipeAction[], side: "left" | "right") => {
    if (actions.length === 0) return null;

    return (
      <View
        style={[
          styles.actionsContainer,
          side === "left" ? styles.leftActions : styles.rightActions,
        ]}
      >
        {actions.map((action, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.action, { backgroundColor: action.backgroundColor }]}
            onPress={() => {
              action.onPress();
              // Reset position after action
              lastOffset.current = 0;
              Animated.spring(translateX, {
                toValue: 0,
                useNativeDriver: true,
                tension: 100,
                friction: 8,
              }).start();
            }}
            accessibilityRole="button"
            accessibilityLabel={action.accessibilityLabel || action.label}
            accessibilityHint={action.accessibilityHint}
          >
            <IconSymbol name={action.icon} size={20} color={action.color} />
            <Text style={[styles.actionText, { color: action.color }]}>
              {action.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const resetPosition = () => {
    lastOffset.current = 0;
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };

  return (
    <View style={styles.container}>
      {renderActions(leftActions, "left")}
      {renderActions(rightActions, "right")}

      <PanGestureHandler
        onGestureEvent={handleGestureEvent}
        onHandlerStateChange={handleStateChange}
        activeOffsetX={[-10, 10]}
        failOffsetY={[-20, 20]}
      >
        <Animated.View
          style={[
            styles.row,
            {
              transform: [{ translateX }],
            },
          ]}
        >
          {children}
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
};

export default SwipeableRow;
