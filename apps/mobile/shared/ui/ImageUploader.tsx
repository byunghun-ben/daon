import React from "react";
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useThemedStyles } from "../lib/hooks/useTheme";
import { ImagePickerResult, ImagePickerService } from "../lib/imagePicker";

interface ImageUploaderProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  aspectRatio?: [number, number];
  disabled?: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  images,
  onImagesChange,
  maxImages = 5,
  disabled = false,
}) => {
  const styles = useThemedStyles((theme) => ({
    container: {
      marginVertical: theme.spacing.sm,
    },
    label: {
      fontSize: theme.typography.body2.fontSize,
      fontWeight: "600" as const,
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
    },
    imagesContainer: {
      flexDirection: "row" as const,
      flexWrap: "wrap" as const,
      gap: theme.spacing.sm,
    },
    imageItem: {
      position: "relative" as const,
      width: 80,
      height: 80,
    },
    image: {
      width: 80,
      height: 80,
      borderRadius: theme.borderRadius.sm,
      backgroundColor: theme.colors.surface,
    },
    removeButton: {
      position: "absolute" as const,
      top: -8,
      right: -8,
      backgroundColor: theme.colors.error,
      borderRadius: 12,
      width: 24,
      height: 24,
      justifyContent: "center" as const,
      alignItems: "center" as const,
      borderWidth: 2,
      borderColor: theme.colors.white,
    },
    removeButtonText: {
      color: theme.colors.white,
      fontSize: 12,
      fontWeight: "bold" as const,
      lineHeight: 12,
    },
    addButton: {
      width: 80,
      height: 80,
      borderRadius: theme.borderRadius.sm,
      borderWidth: 2,
      borderColor: theme.colors.border,
      borderStyle: "dashed" as const,
      justifyContent: "center" as const,
      alignItems: "center" as const,
      backgroundColor: theme.colors.surface,
    },
    addButtonDisabled: {
      opacity: 0.5,
    },
    addButtonText: {
      fontSize: 24,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.xs,
    },
    addButtonLabel: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.textSecondary,
      textAlign: "center" as const,
    },
    imageCount: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.xs,
    },
  }));

  const handleAddImages = () => {
    if (disabled || images.length >= maxImages) return;

    const remainingSlots = maxImages - images.length;

    ImagePickerService.showImagePickerOptions(
      (pickedImages: ImagePickerResult[]) => {
        const newImages = pickedImages
          .slice(0, remainingSlots)
          .map((img) => img.uri);
        onImagesChange([...images, ...newImages]);
      },
      (photo: ImagePickerResult) => {
        onImagesChange([...images, photo.uri]);
      },
      {
        allowsMultipleSelection: remainingSlots > 1,
        maxSelection: remainingSlots,
      },
    );
  };

  const handleRemoveImage = (index: number) => {
    Alert.alert("사진 삭제", "이 사진을 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: () => {
          const newImages = images.filter((_, i) => i !== index);
          onImagesChange(newImages);
        },
      },
    ]);
  };

  const canAddMore = !disabled && images.length < maxImages;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        사진 ({images.length}/{maxImages})
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.imagesContainer}
      >
        {images.map((uri, index) => (
          <View key={index} style={styles.imageItem}>
            <Image source={{ uri }} style={styles.image} />
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRemoveImage(index)}
            >
              <Text style={styles.removeButtonText}>×</Text>
            </TouchableOpacity>
          </View>
        ))}

        {canAddMore && (
          <TouchableOpacity
            style={[styles.addButton, disabled && styles.addButtonDisabled]}
            onPress={handleAddImages}
            disabled={disabled}
          >
            <Text style={styles.addButtonText}>+</Text>
            <Text style={styles.addButtonLabel}>사진{"\n"}추가</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {images.length > 0 && (
        <Text style={styles.imageCount}>
          {maxImages - images.length}장 더 추가할 수 있습니다
        </Text>
      )}
    </View>
  );
};
