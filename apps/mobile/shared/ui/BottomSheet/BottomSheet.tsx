import React, { forwardRef, useCallback, useMemo } from "react";
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetView,
  type BottomSheetModalProps,
  type BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import { useThemedStyles } from "@/shared/lib/hooks/useTheme";

interface BottomSheetProps extends Partial<BottomSheetModalProps> {
  children: React.ReactNode;
  snapPoints?: (string | number)[];
  enablePanDownToClose?: boolean;
  enableDynamicSizing?: boolean;
}

export const BottomSheet = forwardRef<BottomSheetModal, BottomSheetProps>(
  (
    {
      children,
      snapPoints: customSnapPoints,
      enablePanDownToClose = true,
      enableDynamicSizing = false,
      ...props
    },
    ref
  ) => {
    const styles = useThemedStyles((theme) => ({
      container: {
        backgroundColor: theme.colors.surface,
        borderTopLeftRadius: theme.borderRadius.xl,
        borderTopRightRadius: theme.borderRadius.xl,
        paddingHorizontal: theme.spacing.lg,
        paddingTop: theme.spacing.md,
        paddingBottom: theme.spacing.xl,
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: -2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 5,
        elevation: 5,
      },
      handleIndicator: {
        backgroundColor: theme.colors.border,
        width: 40,
        height: 4,
        borderRadius: 2,
        alignSelf: "center" as const,
        marginBottom: theme.spacing.md,
      },
    }));

    // Default snap points if not provided
    const snapPoints = useMemo(
      () => customSnapPoints || ["25%", "50%", "75%"],
      [customSnapPoints]
    );

    // Custom backdrop component
    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.5}
          pressBehavior="close"
        />
      ),
      []
    );

    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={snapPoints}
        enablePanDownToClose={enablePanDownToClose}
        enableDynamicSizing={enableDynamicSizing}
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={styles.handleIndicator}
        backgroundStyle={styles.container}
        {...props}
      >
        <BottomSheetView>{children}</BottomSheetView>
      </BottomSheetModal>
    );
  }
);

BottomSheet.displayName = "BottomSheet";