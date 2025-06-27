import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Keyboard,
  Modal,
  PanResponder,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useThemedStyles } from "../lib/hooks/useTheme";

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  height?: number;
}

const SCREEN_HEIGHT = Dimensions.get("window").height;
const DEFAULT_HEIGHT = SCREEN_HEIGHT * 0.6;

const BottomSheet: React.FC<BottomSheetProps> = ({
  visible,
  onClose,
  title,
  children,
  height = DEFAULT_HEIGHT,
}) => {
  const translateY = useRef(new Animated.Value(height)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const keyboardHeight = useRef(new Animated.Value(0)).current;

  const styles = useThemedStyles((theme) => ({
    modal: {
      margin: 0,
      justifyContent: "flex-end",
    },
    backdrop: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    container: {
      backgroundColor: theme.colors.surface,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      minHeight: height,
      maxHeight: SCREEN_HEIGHT * 0.9,
    },
    handle: {
      width: 40,
      height: 4,
      backgroundColor: theme.colors.border,
      borderRadius: 2,
      alignSelf: "center" as const,
      marginTop: theme.spacing.sm,
      marginBottom: theme.spacing.md,
    },
    header: {
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    title: {
      fontSize: theme.typography.title.fontSize,
      fontWeight: theme.typography.title.fontWeight,
      color: theme.colors.text.primary,
      textAlign: "center" as const,
    },
    content: {
      flex: 1,
      padding: theme.spacing.lg,
    },
  }));

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // 세로 스크롤이 가로 스크롤보다 크고, 아래로 드래그할 때만 응답
        return (
          Math.abs(gestureState.dy) > Math.abs(gestureState.dx) &&
          gestureState.dy > 10
        );
      },
      onPanResponderGrant: () => {
        // 제스처 시작 시 현재 애니메이션 중지
        translateY.stopAnimation();
        keyboardHeight.stopAnimation();
      },
      onPanResponderMove: (_, gestureState) => {
        // 아래로 드래그할 때만 응답
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        const shouldClose =
          gestureState.dy > height * 0.2 || gestureState.vy > 1.2;

        if (shouldClose) {
          closeBottomSheet();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 65,
            friction: 11,
          }).start();
        }
      },
    }),
  ).current;

  const openBottomSheet = () => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeBottomSheet = () => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: height,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  useEffect(() => {
    if (visible) {
      // 약간의 지연을 주어 Modal이 완전히 렌더링된 후 애니메이션 시작
      requestAnimationFrame(() => {
        openBottomSheet();
      });
    } else {
      translateY.setValue(height);
      backdropOpacity.setValue(0);
    }
  }, [visible, height]);

  useEffect(() => {
    if (!visible) return;

    const keyboardWillShow = Keyboard.addListener(
      "keyboardWillShow",
      (event) => {
        Animated.timing(keyboardHeight, {
          toValue: event.endCoordinates.height,
          duration: event.duration,
          useNativeDriver: true,
        }).start();
      },
    );

    const keyboardWillHide = Keyboard.addListener(
      "keyboardWillHide",
      (event) => {
        Animated.timing(keyboardHeight, {
          toValue: 0,
          duration: event.duration,
          useNativeDriver: true,
        }).start();
      },
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, [visible, keyboardHeight]);

  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={closeBottomSheet}
    >
      <View style={StyleSheet.absoluteFill}>
        <TouchableWithoutFeedback onPress={closeBottomSheet}>
          <Animated.View
            style={[
              styles.backdrop,
              {
                opacity: backdropOpacity,
              },
            ]}
          />
        </TouchableWithoutFeedback>
        <Animated.View
          style={[
            styles.container,
            {
              transform: [
                {
                  translateY: Animated.add(
                    translateY,
                    Animated.multiply(keyboardHeight, -1),
                  ),
                },
              ],
            },
          ]}
          {...panResponder.panHandlers}
        >
          <View style={styles.handle} />
          {title && (
            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
            </View>
          )}
          <View style={styles.content}>{children}</View>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default BottomSheet;
