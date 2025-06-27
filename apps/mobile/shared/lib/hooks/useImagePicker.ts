import { useState } from "react";
import { Alert } from "react-native";
import {
  ImagePickerResponse,
  launchCamera,
  launchImageLibrary,
  CameraOptions,
  ImageLibraryOptions,
} from "react-native-image-picker";
import {
  requestCameraPermissionForPhoto,
  requestPhotoLibraryPermissionForSelection,
} from "../permissions";

export interface ImagePickerOptions
  extends Partial<CameraOptions & ImageLibraryOptions> {
  // 필요한 경우 추가 옵션을 여기에 정의
}

export interface SelectedImage {
  uri: string;
  fileName?: string;
  type?: string;
  fileSize?: number;
  width?: number;
  height?: number;
}

export interface UseImagePickerReturn {
  selectedImages: SelectedImage[];
  isLoading: boolean;
  pickFromCamera: () => Promise<void>;
  pickFromGallery: () => Promise<void>;
  showImagePicker: () => void;
  removeImage: (index: number) => void;
  clearImages: () => void;
}

const defaultOptions: CameraOptions & ImageLibraryOptions = {
  mediaType: "photo",
  quality: 0.8,
  maxWidth: 1024,
  maxHeight: 1024,
  includeBase64: false,
};

/**
 * 이미지 선택을 위한 훅
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
      const hasPermission = await requestCameraPermissionForPhoto();
      if (!hasPermission) {
        setIsLoading(false);
        return;
      }

      // 카메라 실행
      launchCamera(pickerOptions, handleImagePickerResponse);
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
      // 갤러리 권한 요청
      const hasPermission = await requestPhotoLibraryPermissionForSelection();
      if (!hasPermission) {
        setIsLoading(false);
        return;
      }

      // 갤러리 실행
      launchImageLibrary(pickerOptions, handleImagePickerResponse);
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
   * 이미지 피커 응답 처리
   */
  const handleImagePickerResponse = (response: ImagePickerResponse): void => {
    setIsLoading(false);

    if (response.didCancel) {
      return;
    }

    if (response.errorMessage) {
      console.error("이미지 피커 오류:", response.errorMessage);
      Alert.alert("오류", "이미지를 선택할 수 없습니다.");
      return;
    }

    if (response.assets && response.assets.length > 0) {
      const newImages: SelectedImage[] = response.assets.map((asset) => ({
        uri: asset.uri!,
        fileName: asset.fileName,
        type: asset.type,
        fileSize: asset.fileSize,
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
