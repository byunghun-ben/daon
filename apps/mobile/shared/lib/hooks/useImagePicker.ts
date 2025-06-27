import {
  ImagePickerOptions,
  ImagePickerResult,
  launchCameraAsync,
  launchImageLibraryAsync,
  requestCameraPermissionsAsync,
  requestMediaLibraryPermissionsAsync,
} from "expo-image-picker";
import { useState } from "react";
import { Alert } from "react-native";

interface SelectedImage {
  uri: string;
  fileName?: string;
  type?: string;
  fileSize?: number;
  width?: number;
  height?: number;
}

interface UseImagePickerReturn {
  selectedImages: SelectedImage[];
  isLoading: boolean;
  pickFromCamera: () => Promise<void>;
  pickFromGallery: () => Promise<void>;
  showImagePicker: () => void;
  removeImage: (index: number) => void;
  clearImages: () => void;
}

const defaultOptions: ImagePickerOptions = {
  mediaTypes: ["images"],
  quality: 0.8,
  allowsEditing: true,
  aspect: [1, 1],
  allowsMultipleSelection: false,
};

/**
 * 이미지 선택을 위한 훅 (Expo Image Picker 사용)
 * 카메라 촬영과 갤러리 선택 기능을 제공하며, 권한 요청도 자동으로 처리
 */
export const useImagePicker = (
  options: ImagePickerOptions = {},
): UseImagePickerReturn => {
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const pickerOptions = {
    ...defaultOptions,
    ...options,
  };

  /**
   * 카메라에서 사진 촬영
   */
  const pickFromCamera = async (): Promise<void> => {
    setIsLoading(true);
    try {
      // 카메라 권한 요청
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
        setIsLoading(false);
        return;
      }

      // 카메라 실행
      const result = await launchCameraAsync(pickerOptions);
      handleImagePickerResult(result);
    } catch (error) {
      console.error("카메라 실행 실패:", error);
      Alert.alert("오류", "카메라를 실행할 수 없습니다.");
      setIsLoading(false);
    }
  };

  /**
   * 갤러리에서 사진 선택
   */
  const pickFromGallery = async (): Promise<void> => {
    setIsLoading(true);
    try {
      // 미디어 라이브러리 권한 요청
      const mediaPermission = await requestMediaLibraryPermissionsAsync();
      if (!mediaPermission.granted) {
        Alert.alert(
          "권한 필요",
          "사진 선택을 위해 권한이 필요합니다. 설정에서 권한을 허용해주세요.",
          [
            { text: "취소", style: "cancel" },
            {
              text: "설정으로 이동",
              onPress: () => requestMediaLibraryPermissionsAsync(),
            },
          ],
        );
        setIsLoading(false);
        return;
      }

      // 갤러리 실행
      const result = await launchImageLibraryAsync(pickerOptions);
      handleImagePickerResult(result);
    } catch (error) {
      console.error("갤러리 실행 실패:", error);
      Alert.alert("오류", "갤러리를 실행할 수 없습니다.");
      setIsLoading(false);
    }
  };

  /**
   * 이미지 선택 방법을 묻는 알림 표시
   */
  const showImagePicker = (): void => {
    Alert.alert("사진 선택", "사진을 어떻게 추가하시겠습니까?", [
      {
        text: "취소",
        style: "cancel",
      },
      {
        text: "카메라",
        onPress: pickFromCamera,
      },
      {
        text: "갤러리",
        onPress: pickFromGallery,
      },
    ]);
  };

  /**
   * 이미지 피커 결과 처리
   */
  const handleImagePickerResult = (result: ImagePickerResult): void => {
    setIsLoading(false);

    if (result.canceled) {
      return;
    }

    if (result.assets && result.assets.length > 0) {
      const newImages: SelectedImage[] = result.assets.map((asset) => ({
        uri: asset.uri,
        fileName: asset.fileName || undefined,
        type: asset.type || undefined,
        fileSize: asset.fileSize || undefined,
        width: asset.width,
        height: asset.height,
      }));

      setSelectedImages((prev) => [...prev, ...newImages]);
    }
  };

  /**
   * 선택된 이미지 제거
   */
  const removeImage = (index: number): void => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  /**
   * 모든 이미지 제거
   */
  const clearImages = (): void => {
    setSelectedImages([]);
  };

  return {
    selectedImages,
    isLoading,
    pickFromCamera,
    pickFromGallery,
    showImagePicker,
    removeImage,
    clearImages,
  };
};
