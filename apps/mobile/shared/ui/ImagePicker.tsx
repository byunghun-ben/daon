import React from "react";
import {
  ActivityIndicator,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useImageUpload } from "../lib/hooks/useImageUpload";
import { useThemedStyles } from "../lib/hooks/useTheme";

interface ImagePickerProps {
  value?: string | null;
  onImageSelected: (imageUrl: string | null) => void;
  error?: string;
  label?: string;
  placeholder?: string;
}

const ImagePicker = ({
  value,
  onImageSelected,
  error,
  label = "사진",
  placeholder = "사진을 선택해주세요",
}: ImagePickerProps) => {
  const { uploadImage, isUploading, uploadProgress } = useImageUpload({
    maxWidth: 800,
    maxHeight: 800,
    quality: 0.8,
  });

  const styles = useThemedStyles((theme) => ({
    container: {
      marginBottom: theme.spacing.md,
    },
    label: {
      fontSize: theme.typography.body2.fontSize,
      fontWeight: "500" as const,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.xs,
    },
    imageContainer: {
      borderWidth: 2,
      borderColor: error ? theme.colors.error : theme.colors.border,
      borderRadius: theme.borderRadius.md,
      borderStyle: "dashed" as const,
      minHeight: 120,
      justifyContent: "center" as const,
      alignItems: "center" as const,
      backgroundColor: theme.colors.surface,
      overflow: "hidden" as const,
    },
    imageContainerWithImage: {
      borderStyle: "solid" as const,
      borderColor: theme.colors.border,
      padding: 0,
    },
    placeholderContent: {
      alignItems: "center" as const,
      padding: theme.spacing.md,
    },
    placeholderText: {
      fontSize: theme.typography.body2.fontSize,
      color: theme.colors.text.secondary,
      textAlign: "center" as const,
      marginBottom: theme.spacing.xs,
    },
    uploadButton: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.sm,
    },
    uploadButtonText: {
      color: "#ffffff",
      fontSize: theme.typography.body2.fontSize,
      fontWeight: "500" as const,
    },
    image: {
      width: "100%" as const,
      height: 120,
      borderRadius: theme.borderRadius.md,
    },
    imageOverlay: {
      position: "absolute" as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.3)",
      justifyContent: "center" as const,
      alignItems: "center" as const,
    },
    changeButton: {
      backgroundColor: "rgba(255,255,255,0.9)",
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.sm,
    },
    changeButtonText: {
      color: theme.colors.text.primary,
      fontSize: theme.typography.caption.fontSize,
      fontWeight: "500" as const,
    },
    progressContainer: {
      marginTop: theme.spacing.xs,
      alignItems: "center" as const,
    },
    progressText: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.text.secondary,
      marginTop: theme.spacing.xs,
    },
    errorText: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.error,
      marginTop: theme.spacing.xs,
    },
    loadingContainer: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      justifyContent: "center" as const,
      padding: theme.spacing.md,
    },
    loadingText: {
      marginLeft: theme.spacing.xs,
      fontSize: theme.typography.body2.fontSize,
      color: theme.colors.text.secondary,
    },
  }));

  const handleImageUpload = async () => {
    const imageUrl = await uploadImage();
    if (imageUrl) {
      onImageSelected(imageUrl);
    }
  };

  const renderImageContent = () => {
    if (isUploading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="small"
            color={styles.uploadButton.backgroundColor}
          />
          <Text style={styles.loadingText}>업로드 중...</Text>
        </View>
      );
    }

    if (value) {
      return (
        <TouchableOpacity
          onPress={handleImageUpload}
          style={{ position: "relative" }}
        >
          <Image
            source={{ uri: value }}
            style={styles.image}
            resizeMode="cover"
          />
          <View style={styles.imageOverlay}>
            <View style={styles.changeButton}>
              <Text style={styles.changeButtonText}>변경</Text>
            </View>
          </View>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        onPress={handleImageUpload}
        style={styles.placeholderContent}
      >
        <Text style={styles.placeholderText}>{placeholder}</Text>
        <View style={styles.uploadButton}>
          <Text style={styles.uploadButtonText}>사진 선택</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[styles.imageContainer, value && styles.imageContainerWithImage]}
      >
        {renderImageContent()}
      </View>

      {isUploading && uploadProgress > 0 && (
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            업로드 진행률: {uploadProgress}%
          </Text>
        </View>
      )}

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

export default ImagePicker;
