import { uploadFile } from "@/shared/api/upload";
import {
  launchCameraAsync,
  launchImageLibraryAsync,
  requestCameraPermissionsAsync,
  requestMediaLibraryPermissionsAsync,
  type ImagePickerOptions,
  type ImagePickerResult,
} from "expo-image-picker";
import { useState } from "react";
import { Alert } from "react-native";
// import { PERMISSIONS, request, RESULTS } from "react-native-permissions";

interface UseImageUploadReturn {
  uploadImage: () => Promise<string | null>;
  isUploading: boolean;
  uploadProgress: number;
}

export const useImageUpload = (
  options: ImagePickerOptions = {},
): UseImageUploadReturn => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const defaultOptions: ImagePickerOptions = {
    mediaTypes: options.mediaTypes || ["images"],
    allowsEditing: options.allowsEditing || false,
    aspect: options.aspect || [1, 1],
    allowsMultipleSelection: options.allowsMultipleSelection || false,
    quality: options.quality || 0.8,
  };

  const requestPermissions = async (): Promise<boolean> => {
    try {
      const cameraPermission = await requestCameraPermissionsAsync();

      if (!cameraPermission.granted) {
        Alert.alert(
          "권한 필요",
          "카메라 사용을 위해 권한이 필요합니다. 설정에서 권한을 허용해주세요.",
          [
            { text: "취소", style: "cancel" },
            {
              text: "설정으로 이동",
              onPress: () => requestCameraPermissionsAsync(),
            },
          ],
        );
        return false;
      }

      const photoPermission = await requestMediaLibraryPermissionsAsync();

      if (!photoPermission.granted) {
        Alert.alert(
          "권한 필요",
          "사진 라이브러리 접근을 위해 권한이 필요합니다. 설정에서 권한을 허용해주세요.",
          [
            { text: "취소", style: "cancel" },
            {
              text: "설정으로 이동",
              onPress: () => requestMediaLibraryPermissionsAsync(),
            },
          ],
        );
        return false;
      }

      return true;
    } catch (error) {
      console.error("Permission request failed:", error);
      return false;
    }
  };

  const showImagePicker = (): Promise<ImagePickerResult | null> => {
    return new Promise((resolve) => {
      Alert.alert(
        "사진 선택",
        "사진을 어떻게 추가하시겠습니까?",
        [
          {
            text: "취소",
            style: "cancel",
            onPress: () => resolve(null),
          },
          {
            text: "갤러리에서 선택",
            onPress: () => {
              launchImageLibraryAsync(defaultOptions).then((response) => {
                resolve(response);
              });
            },
          },
          {
            text: "카메라로 촬영",
            onPress: () => {
              const cameraOptions: ImagePickerOptions = {
                ...defaultOptions,
                selectionLimit: 1,
              };
              launchCameraAsync(cameraOptions).then((response) => {
                resolve(response);
              });
            },
          },
        ],
        { cancelable: true },
      );
    });
  };

  const uploadToR2 = async (
    imageUri: string,
    fileName: string,
    fileType: string,
    fileSize?: number,
  ): Promise<string | null> => {
    try {
      // 파일 크기가 없으면 추정값 사용
      const size = fileSize || 1024 * 1024; // 1MB로 추정

      const result = await uploadFile(
        {
          uri: imageUri,
          type: fileType,
          name: fileName,
          size,
        },
        "profile", // 기본적으로 프로필 카테고리 사용
        (progress) => {
          setUploadProgress(progress);
        },
      );

      if (result.success && result.publicUrl) {
        return result.publicUrl;
      } else {
        throw new Error(result.error || "업로드에 실패했습니다");
      }
    } catch (error) {
      console.error("Upload failed:", error);
      throw new Error("이미지 업로드에 실패했습니다.");
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    try {
      setIsUploading(true);
      setUploadProgress(0);

      // 권한 확인
      const hasPermissions = await requestPermissions();
      if (!hasPermissions) {
        return null;
      }

      // 이미지 선택
      const response = await showImagePicker();
      if (!response || response.canceled) {
        return null;
      }

      const asset = response.assets?.[0];
      if (!asset?.uri) {
        throw new Error("선택된 이미지가 없습니다.");
      }

      // R2에 업로드
      const fileName = asset.fileName || `image_${Date.now()}.jpg`;
      const fileType = asset.type || "image/jpeg";
      const fileSize = asset.fileSize;

      const uploadedUrl = await uploadToR2(
        asset.uri,
        fileName,
        fileType,
        fileSize,
      );
      return uploadedUrl;
    } catch (error) {
      console.error("Image upload error:", error);
      Alert.alert(
        "오류",
        error instanceof Error
          ? error.message
          : "이미지 업로드 중 오류가 발생했습니다.",
      );
      return null;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return {
    uploadImage,
    isUploading,
    uploadProgress,
  };
};
