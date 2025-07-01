import { apiClient } from "./client";

export interface PresignedUrlRequest {
  fileName: string;
  fileType: string;
  fileSize: number;
  category?: "profile" | "diary" | "activity" | "growth";
}

export interface PresignedUrlResponse {
  uploadUrl: string;
  fileKey: string;
  publicUrl: string;
  expiresIn: number;
}

export interface ConfirmUploadRequest {
  fileKey: string;
}

export interface ConfirmUploadResponse {
  success: boolean;
  publicUrl: string;
}

export interface FileUploadResult {
  success: boolean;
  publicUrl?: string;
  error?: string;
}

/**
 * Presigned URL 생성
 */
export const generatePresignedUrl = async (
  request: PresignedUrlRequest,
): Promise<PresignedUrlResponse> => {
  const response = await apiClient.post<{
    success: boolean;
    data: PresignedUrlResponse;
  }>("/upload/presigned-url", request);

  if (!response.success) {
    throw new Error("Presigned URL 생성에 실패했습니다");
  }

  return response.data;
};

/**
 * 업로드 완료 확인
 */
export const confirmUpload = async (
  request: ConfirmUploadRequest,
): Promise<ConfirmUploadResponse> => {
  const response = await apiClient.post<{
    success: boolean;
    data: ConfirmUploadResponse;
  }>("/upload/confirm", request);

  if (!response.success) {
    throw new Error("업로드 확인에 실패했습니다");
  }

  return response.data;
};

/**
 * 파일을 R2에 직접 업로드
 */
export const uploadFileToR2 = async (
  uploadUrl: string,
  file: {
    uri: string;
    type: string;
    name: string;
  },
  onProgress?: (progress: number) => void,
): Promise<boolean> => {
  try {
    const formData = new FormData();
    formData.append("file", {
      uri: file.uri,
      type: file.type,
      name: file.name,
    } as unknown as File);

    const xhr = new XMLHttpRequest();

    return new Promise((resolve, reject) => {
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = (event.loaded / event.total) * 100;
          onProgress(Math.round(progress));
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(true);
        } else {
          reject(new Error(`업로드 실패: ${xhr.status} ${xhr.statusText}`));
        }
      });

      xhr.addEventListener("error", () => {
        reject(new Error("네트워크 오류가 발생했습니다"));
      });

      xhr.addEventListener("timeout", () => {
        reject(new Error("업로드 시간이 초과되었습니다"));
      });

      xhr.open("PUT", uploadUrl);
      xhr.setRequestHeader("Content-Type", file.type);
      xhr.timeout = 30000; // 30초 타임아웃

      // 파일 데이터만 전송 (FormData가 아닌 직접 파일 데이터)
      fetch(file.uri)
        .then((response) => response.blob())
        .then((blob) => {
          xhr.send(blob);
        })
        .catch(reject);
    });
  } catch (error) {
    console.error("File upload error:", error);
    throw error;
  }
};

/**
 * 전체 파일 업로드 프로세스 (Presigned URL + 업로드 + 확인)
 */
export const uploadFile = async (
  file: {
    uri: string;
    type: string;
    name: string;
    size: number;
  },
  category?: "profile" | "diary" | "activity" | "growth",
  onProgress?: (progress: number) => void,
): Promise<FileUploadResult> => {
  try {
    // 1단계: Presigned URL 생성
    onProgress?.(10);
    const presignedData = await generatePresignedUrl({
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      category,
    });

    // 2단계: R2에 파일 업로드
    onProgress?.(20);
    const uploadSuccess = await uploadFileToR2(
      presignedData.uploadUrl,
      file,
      (progress) => {
        // 업로드 진행률을 20~90%로 매핑
        const mappedProgress = 20 + (progress * 70) / 100;
        onProgress?.(Math.round(mappedProgress));
      },
    );

    if (!uploadSuccess) {
      throw new Error("파일 업로드에 실패했습니다");
    }

    // 3단계: 업로드 완료 확인
    onProgress?.(95);
    const confirmResult = await confirmUpload({
      fileKey: presignedData.fileKey,
    });

    onProgress?.(100);

    return {
      success: true,
      publicUrl: confirmResult.publicUrl,
    };
  } catch (error) {
    console.error("Upload process failed:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다",
    };
  }
};
