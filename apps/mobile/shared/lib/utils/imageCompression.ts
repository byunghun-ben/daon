import * as ImageManipulator from "expo-image-manipulator";

interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: "jpeg" | "png";
}

const DEFAULT_OPTIONS: CompressionOptions = {
  maxWidth: 1920,
  maxHeight: 1920,
  quality: 0.8,
  format: "jpeg",
};

export async function compressImage(
  uri: string,
  options: CompressionOptions = {},
): Promise<{ uri: string; width: number; height: number; size?: number }> {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

  try {
    // Get original image dimensions
    const originalImage = await ImageManipulator.manipulateAsync(uri, [], {
      compress: 1,
      format: ImageManipulator.SaveFormat.JPEG,
    });

    // Calculate resize dimensions maintaining aspect ratio
    const { width: originalWidth, height: originalHeight } = originalImage;
    let width = originalWidth;
    let height = originalHeight;

    if (mergedOptions.maxWidth && width > mergedOptions.maxWidth) {
      height = (height * mergedOptions.maxWidth) / width;
      width = mergedOptions.maxWidth;
    }

    if (mergedOptions.maxHeight && height > mergedOptions.maxHeight) {
      width = (width * mergedOptions.maxHeight) / height;
      height = mergedOptions.maxHeight;
    }

    // Resize and compress the image
    const actions: ImageManipulator.Action[] = [];

    // Only resize if dimensions changed
    if (width !== originalWidth || height !== originalHeight) {
      actions.push({ resize: { width, height } });
    }

    const result = await ImageManipulator.manipulateAsync(uri, actions, {
      compress: mergedOptions.quality!,
      format:
        mergedOptions.format === "png"
          ? ImageManipulator.SaveFormat.PNG
          : ImageManipulator.SaveFormat.JPEG,
    });

    // Try to get file size (this might not always be available)
    let size: number | undefined;
    try {
      const response = await fetch(result.uri);
      const blob = await response.blob();
      size = blob.size;
    } catch {
      // Size calculation failed, continue without it
    }

    return {
      uri: result.uri,
      width: result.width,
      height: result.height,
      size,
    };
  } catch (error) {
    console.error("Image compression failed:", error);
    throw new Error("이미지 압축에 실패했습니다.");
  }
}

// Compress multiple images in parallel
export async function compressImages(
  uris: string[],
  options: CompressionOptions = {},
): Promise<{ uri: string; width: number; height: number; size?: number }[]> {
  return Promise.all(uris.map((uri) => compressImage(uri, options)));
}

// Get image size estimate based on dimensions and quality
export function estimateImageSize(
  width: number,
  height: number,
  quality = 0.8,
  format: "jpeg" | "png" = "jpeg",
): number {
  // Rough estimation: pixels * bytes per pixel * compression factor
  const pixelCount = width * height;
  const bytesPerPixel = format === "png" ? 4 : 3;
  const compressionFactor = format === "png" ? 0.5 : quality * 0.15;

  return Math.round(pixelCount * bytesPerPixel * compressionFactor);
}
