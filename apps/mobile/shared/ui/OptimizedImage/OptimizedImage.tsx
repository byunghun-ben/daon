import React, { useState, useEffect } from "react";
import {
  View,
  ActivityIndicator,
  Text,
  ViewStyle,
  ImageStyle,
} from "react-native";
import { Image } from "expo-image";
import { useThemedStyles } from "../../lib/hooks/useTheme";
import {
  optimizeImage,
  createThumbnail,
  OptimizedImage as OptimizedImageType,
  ImageOptimizationOptions,
} from "../../lib/imageOptimization";

interface OptimizedImageProps {
  source: { uri: string } | string;
  style?: ImageStyle;
  containerStyle?: ViewStyle;
  placeholder?: React.ReactNode;
  fallback?: React.ReactNode;
  loadingIndicator?: React.ReactNode;
  optimization?: ImageOptimizationOptions;
  lazy?: boolean;
  thumbnail?: boolean;
  onLoad?: (optimizedImage: OptimizedImageType) => void;
  onError?: (error: Error) => void;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  source,
  style,
  containerStyle,
  placeholder,
  fallback,
  loadingIndicator,
  optimization,
  lazy = false,
  thumbnail = false,
  onLoad,
  onError,
  accessibilityLabel,
  accessibilityHint,
}) => {
  const [optimizedUri, setOptimizedUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [shouldLoad, setShouldLoad] = useState(!lazy);

  const styles = useThemedStyles((theme) => ({
    container: {
      overflow: "hidden" as const,
    },
    image: {
      width: "100%" as const,
      height: "100%" as const,
    },
    loadingContainer: {
      position: "absolute" as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: "center" as const,
      alignItems: "center" as const,
      backgroundColor: theme.colors.surfaceSecondary || theme.colors.surface,
    },
    errorContainer: {
      position: "absolute" as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: "center" as const,
      alignItems: "center" as const,
      backgroundColor: theme.colors.surfaceSecondary || theme.colors.surface,
    },
    errorText: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.textMuted || theme.colors.textSecondary,
      textAlign: "center" as const,
      marginTop: theme.spacing.sm,
    },
    placeholderContainer: {
      position: "absolute" as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: "center" as const,
      alignItems: "center" as const,
      backgroundColor: theme.colors.surfaceSecondary || theme.colors.surface,
    },
  }));

  // Extract URI from source
  const sourceUri = typeof source === "string" ? source : source.uri;

  // Load and optimize image
  useEffect(() => {
    if (!shouldLoad || !sourceUri) return;

    let isMounted = true;

    const loadImage = async () => {
      try {
        setIsLoading(true);
        setError(null);

        let optimizedImage: OptimizedImageType;

        if (thumbnail) {
          optimizedImage = await createThumbnail(sourceUri);
        } else {
          optimizedImage = await optimizeImage(sourceUri, optimization);
        }

        if (isMounted) {
          setOptimizedUri(optimizedImage.uri);
          onLoad?.(optimizedImage);
        }
      } catch (err) {
        if (isMounted) {
          const error = err instanceof Error ? err : new Error("Failed to load image");
          setError(error);
          onError?.(error);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadImage();

    return () => {
      isMounted = false;
    };
  }, [sourceUri, shouldLoad, thumbnail, optimization, onLoad, onError]);

  // Handle lazy loading trigger
  const handleLayout = () => {
    if (lazy && !shouldLoad) {
      setShouldLoad(true);
    }
  };

  // Render loading state
  if (isLoading && shouldLoad) {
    return (
      <View style={[styles.container, containerStyle]} onLayout={handleLayout}>
        {placeholder || (
          <View style={styles.placeholderContainer}>
            {loadingIndicator || (
              <ActivityIndicator size="small" color="#999" />
            )}
          </View>
        )}
      </View>
    );
  }

  // Render error state
  if (error) {
    return (
      <View style={[styles.container, containerStyle]}>
        {fallback || (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>이미지를 불러올 수 없습니다</Text>
          </View>
        )}
      </View>
    );
  }

  // Render optimized image
  if (optimizedUri) {
    return (
      <View style={[styles.container, containerStyle]} onLayout={handleLayout}>
        <Image
          source={{ uri: optimizedUri }}
          style={[styles.image, style]}
          accessibilityLabel={accessibilityLabel}
          accessibilityHint={accessibilityHint}
          accessibilityRole="image"
          contentFit="cover"
          transition={200}
        />
      </View>
    );
  }

  // Render placeholder for lazy loading
  return (
    <View style={[styles.container, containerStyle]} onLayout={handleLayout}>
      {placeholder || <View style={styles.placeholderContainer} />}
    </View>
  );
};

export default OptimizedImage;