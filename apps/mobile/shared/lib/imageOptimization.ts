import * as ImageManipulator from "expo-image-manipulator";
import * as FileSystem from "expo-file-system";

export interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0-1
  format?: "jpeg" | "png" | "webp";
  progressive?: boolean;
}

export interface OptimizedImage {
  uri: string;
  width: number;
  height: number;
  size: number; // file size in bytes
  format: string;
}

// Default optimization settings
const DEFAULT_OPTIONS: Required<ImageOptimizationOptions> = {
  maxWidth: 1200,
  maxHeight: 1200,
  quality: 0.8,
  format: "jpeg",
  progressive: true,
};

/**
 * Optimizes an image by resizing and compressing it
 */
export async function optimizeImage(
  uri: string,
  options: ImageOptimizationOptions = {}
): Promise<OptimizedImage> {
  const finalOptions = { ...DEFAULT_OPTIONS, ...options };

  try {
    // Get original image info
    const originalInfo = await ImageManipulator.manipulateAsync(uri, [], {
      format: ImageManipulator.SaveFormat.JPEG,
    });

    // Calculate resize dimensions
    const { width: originalWidth, height: originalHeight } = originalInfo;
    const { width: newWidth, height: newHeight } = calculateOptimalDimensions(
      originalWidth,
      originalHeight,
      finalOptions.maxWidth,
      finalOptions.maxHeight
    );

    // Perform image manipulation
    const actions: ImageManipulator.Action[] = [];

    // Resize if needed
    if (newWidth !== originalWidth || newHeight !== originalHeight) {
      actions.push({
        resize: {
          width: newWidth,
          height: newHeight,
        },
      });
    }

    // Convert format and apply quality
    const saveFormat = getSaveFormat(finalOptions.format);
    const result = await ImageManipulator.manipulateAsync(uri, actions, {
      compress: finalOptions.quality,
      format: saveFormat,
      base64: false,
    });

    // Get file size
    const fileInfo = await FileSystem.getInfoAsync(result.uri);
    const size = fileInfo.exists ? fileInfo.size || 0 : 0;

    return {
      uri: result.uri,
      width: result.width,
      height: result.height,
      size,
      format: finalOptions.format,
    };
  } catch (error) {
    console.error("Image optimization failed:", error);
    throw new Error("Failed to optimize image");
  }
}

/**
 * Creates multiple sizes of an image for responsive loading
 */
export async function createImageSizes(
  uri: string,
  sizes: Array<{ name: string; maxWidth: number; maxHeight: number; quality?: number }>
): Promise<Record<string, OptimizedImage>> {
  const results: Record<string, OptimizedImage> = {};

  for (const size of sizes) {
    try {
      const optimized = await optimizeImage(uri, {
        maxWidth: size.maxWidth,
        maxHeight: size.maxHeight,
        quality: size.quality || 0.8,
        format: "jpeg",
      });
      results[size.name] = optimized;
    } catch (error) {
      console.error(`Failed to create ${size.name} size:`, error);
    }
  }

  return results;
}

/**
 * Optimizes image for thumbnail display
 */
export async function createThumbnail(
  uri: string,
  size: number = 150
): Promise<OptimizedImage> {
  return optimizeImage(uri, {
    maxWidth: size,
    maxHeight: size,
    quality: 0.7,
    format: "jpeg",
  });
}

/**
 * Optimizes image for full-screen display
 */
export async function optimizeForDisplay(uri: string): Promise<OptimizedImage> {
  return optimizeImage(uri, {
    maxWidth: 1200,
    maxHeight: 1200,
    quality: 0.85,
    format: "jpeg",
  });
}

/**
 * Optimizes image for upload (smaller file size)
 */
export async function optimizeForUpload(uri: string): Promise<OptimizedImage> {
  return optimizeImage(uri, {
    maxWidth: 800,
    maxHeight: 800,
    quality: 0.7,
    format: "jpeg",
  });
}

/**
 * Calculates optimal dimensions while maintaining aspect ratio
 */
function calculateOptimalDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  const aspectRatio = originalWidth / originalHeight;

  let width = originalWidth;
  let height = originalHeight;

  // Scale down if exceeding max dimensions
  if (width > maxWidth) {
    width = maxWidth;
    height = width / aspectRatio;
  }

  if (height > maxHeight) {
    height = maxHeight;
    width = height * aspectRatio;
  }

  // Round to integers
  return {
    width: Math.round(width),
    height: Math.round(height),
  };
}

/**
 * Converts format string to ImageManipulator format
 */
function getSaveFormat(format: string): ImageManipulator.SaveFormat {
  switch (format.toLowerCase()) {
    case "png":
      return ImageManipulator.SaveFormat.PNG;
    case "webp":
      return ImageManipulator.SaveFormat.WEBP;
    case "jpeg":
    case "jpg":
    default:
      return ImageManipulator.SaveFormat.JPEG;
  }
}

/**
 * Gets estimated file size reduction for given options
 */
export function estimateSizeReduction(
  originalWidth: number,
  originalHeight: number,
  options: ImageOptimizationOptions = {}
): { sizeRatio: number; dimensionRatio: number } {
  const finalOptions = { ...DEFAULT_OPTIONS, ...options };
  
  const { width: newWidth, height: newHeight } = calculateOptimalDimensions(
    originalWidth,
    originalHeight,
    finalOptions.maxWidth,
    finalOptions.maxHeight
  );

  const dimensionRatio = (newWidth * newHeight) / (originalWidth * originalHeight);
  const qualityFactor = finalOptions.quality;
  const sizeRatio = dimensionRatio * qualityFactor;

  return {
    sizeRatio,
    dimensionRatio,
  };
}

/**
 * Validates if image needs optimization
 */
export function shouldOptimizeImage(
  width: number,
  height: number,
  fileSize: number,
  options: ImageOptimizationOptions = {}
): boolean {
  const finalOptions = { ...DEFAULT_OPTIONS, ...options };
  
  // Check dimensions
  const exceedsMaxDimensions = 
    width > finalOptions.maxWidth || height > finalOptions.maxHeight;
  
  // Check file size (assume optimization needed if > 1MB)
  const exceedsMaxSize = fileSize > 1024 * 1024;
  
  return exceedsMaxDimensions || exceedsMaxSize;
}