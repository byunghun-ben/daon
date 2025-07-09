import type { BottomSheetBackdropProps } from "@gorhom/bottom-sheet";
import { 
  BottomSheetModal, 
  BottomSheetBackdrop,
  BottomSheetView 
} from "@gorhom/bottom-sheet";
import { useCallback, useEffect, useRef } from "react";
import { useBottomSheetStore } from "../store/bottomSheetStore";

export function GlobalBottomSheet() {
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const { isOpen, content, snapPoints, closeBottomSheet } =
    useBottomSheetStore();

  const handleSheetChanges = useCallback(
    (index: number) => {
      console.log("[GlobalBottomSheet] handleSheetChanges index:", index, "snapPoints:", snapPoints);
      if (index === -1) {
        closeBottomSheet();
      }
    },
    [closeBottomSheet, snapPoints],
  );

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
    [],
  );

  useEffect(() => {
    if (isOpen && bottomSheetRef.current) {
      console.log("expand - calling present()");
      bottomSheetRef.current.present();
    } else if (!isOpen && bottomSheetRef.current) {
      console.log("closing bottom sheet");
      bottomSheetRef.current.dismiss();
    }
  }, [isOpen]);

  console.log("[GlobalBottomSheet] isOpen:", isOpen, "content:", content);

  // content가 없으면 렌더링하지 않음
  if (!content) return null;

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints || ["50%", "90%"]}
      onChange={handleSheetChanges}
      backdropComponent={renderBackdrop}
      enablePanDownToClose
      backgroundStyle={{
        backgroundColor: "#fff",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
      }}
      handleIndicatorStyle={{
        backgroundColor: "#E0E0E0",
        width: 40,
        height: 4,
      }}
    >
      <BottomSheetView>
        {content}
      </BottomSheetView>
    </BottomSheetModal>
  );
}
