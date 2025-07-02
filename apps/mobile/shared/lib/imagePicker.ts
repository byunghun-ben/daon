import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";

export interface ImagePickerResult {
  uri: string;
  type: "image" | "video";
  fileName?: string;
  fileSize?: number;
}

export class ImagePickerService {
  static async requestPermissions(): Promise<boolean> {
    try {
      const cameraPermission =
        await ImagePicker.requestCameraPermissionsAsync();
      const mediaPermission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!cameraPermission.granted || !mediaPermission.granted) {
        Alert.alert(
          "권한 필요",
          "사진을 업로드하려면 카메라와 갤러리 접근 권한이 필요합니다.",
          [{ text: "확인" }],
        );
        return false;
      }

      return true;
    } catch (error) {
      console.error("Permission request failed:", error);
      return false;
    }
  }

  static async pickImage(
    options: {
      allowsMultipleSelection?: boolean;
      maxSelection?: number;
      quality?: number;
    } = {},
  ): Promise<ImagePickerResult[]> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) return [];

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: options.allowsMultipleSelection || false,
        quality: options.quality || 0.8,
        allowsEditing: !options.allowsMultipleSelection,
        aspect: options.allowsMultipleSelection ? undefined : [4, 3],
      });

      if (result.canceled) return [];

      return result.assets.map((asset) => ({
        uri: asset.uri,
        type: asset.type === "video" ? "video" : "image",
        fileName: asset.fileName || undefined,
        fileSize: asset.fileSize,
      }));
    } catch (error) {
      console.error("Image picker failed:", error);
      Alert.alert("오류", "이미지를 선택하는 중 오류가 발생했습니다.");
      return [];
    }
  }

  static async takePhoto(): Promise<ImagePickerResult | null> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) return null;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (result.canceled) return null;

      const asset = result.assets[0];
      return {
        uri: asset.uri,
        type: asset.type === "video" ? "video" : "image",
        fileName: asset.fileName || undefined,
        fileSize: asset.fileSize,
      };
    } catch (error) {
      console.error("Camera failed:", error);
      Alert.alert("오류", "사진을 촬영하는 중 오류가 발생했습니다.");
      return null;
    }
  }

  static showImagePickerOptions(
    onImagesPicked: (images: ImagePickerResult[]) => void,
    onPhotoPicked: (photo: ImagePickerResult) => void,
    options?: {
      allowsMultipleSelection?: boolean;
      maxSelection?: number;
    },
  ) {
    Alert.alert("사진 선택", "어떤 방법으로 사진을 추가하시겠습니까?", [
      {
        text: "갤러리에서 선택",
        onPress: async () => {
          const images = await this.pickImage(options);
          if (images.length > 0) {
            onImagesPicked(images);
          }
        },
      },
      {
        text: "카메라로 촬영",
        onPress: async () => {
          const photo = await this.takePhoto();
          if (photo) {
            onPhotoPicked(photo);
          }
        },
      },
      {
        text: "취소",
        style: "cancel",
      },
    ]);
  }
}
