import { z } from "zod/v4";

// 업로드 카테고리
export const UPLOAD_CATEGORIES = {
  PROFILE: "profile",
  DIARY: "diary",
  ACTIVITY: "activity",
  GROWTH: "growth",
} as const;

export type UploadCategory =
  (typeof UPLOAD_CATEGORIES)[keyof typeof UPLOAD_CATEGORIES];

// 지원되는 파일 타입
export const SUPPORTED_FILE_TYPES = {
  IMAGE_JPEG: "image/jpeg",
  IMAGE_JPG: "image/jpg",
  IMAGE_PNG: "image/png",
  IMAGE_WEBP: "image/webp",
  VIDEO_MP4: "video/mp4",
  VIDEO_QUICKTIME: "video/quicktime",
} as const;

export type SupportedFileType =
  (typeof SUPPORTED_FILE_TYPES)[keyof typeof SUPPORTED_FILE_TYPES];

// 파일 크기 제한
export const FILE_SIZE_LIMITS = {
  MAX_IMAGE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_VIDEO_SIZE: 50 * 1024 * 1024, // 50MB
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
} as const;

// Presigned URL 요청 스키마
export const PresignedUrlRequestSchema = z.object({
  fileName: z.string().min(1, "파일명은 필수입니다"),
  fileType: z.string().min(1, "파일 타입은 필수입니다"),
  fileSize: z
    .number()
    .min(1, "파일 크기는 필수입니다")
    .max(FILE_SIZE_LIMITS.MAX_FILE_SIZE, "파일 크기가 너무 큽니다"),
  category: z
    .enum([
      UPLOAD_CATEGORIES.PROFILE,
      UPLOAD_CATEGORIES.DIARY,
      UPLOAD_CATEGORIES.ACTIVITY,
      UPLOAD_CATEGORIES.GROWTH,
    ])
    .optional(),
});

export type PresignedUrlRequest = z.infer<typeof PresignedUrlRequestSchema>;

// Presigned URL 응답 스키마
export const PresignedUrlResponseSchema = z.object({
  uploadUrl: z.string().url("유효한 업로드 URL이 아닙니다"),
  fileKey: z.string().min(1, "파일 키는 필수입니다"),
  publicUrl: z.string().url("유효한 공개 URL이 아닙니다"),
  expiresIn: z.number().min(1, "만료 시간은 필수입니다"),
});

export type PresignedUrlResponse = z.infer<typeof PresignedUrlResponseSchema>;

// 업로드 확인 요청 스키마
export const ConfirmUploadRequestSchema = z.object({
  fileKey: z.string().min(1, "파일 키는 필수입니다"),
});

export type ConfirmUploadRequest = z.infer<typeof ConfirmUploadRequestSchema>;

// 업로드 확인 응답 스키마
export const ConfirmUploadResponseSchema = z.object({
  success: z.boolean(),
  publicUrl: z.string().url("유효한 공개 URL이 아닙니다"),
});

export type ConfirmUploadResponse = z.infer<typeof ConfirmUploadResponseSchema>;

// 파일 업로드 결과 스키마
export const FileUploadResultSchema = z.object({
  success: z.boolean(),
  publicUrl: z.string().url().optional(),
  error: z.string().optional(),
});

export type FileUploadResult = z.infer<typeof FileUploadResultSchema>;

// 파일 정보 스키마
export const FileInfoSchema = z.object({
  uri: z.string().min(1, "파일 URI는 필수입니다"),
  type: z.string().min(1, "파일 타입은 필수입니다"),
  name: z.string().min(1, "파일명은 필수입니다"),
  size: z.number().min(1, "파일 크기는 필수입니다"),
});

export type FileInfo = z.infer<typeof FileInfoSchema>;

// 유틸리티 함수들
export const validateFileType = (fileType: string): boolean => {
  return Object.values(SUPPORTED_FILE_TYPES).includes(
    fileType as SupportedFileType,
  );
};

export const validateFileSize = (
  fileSize: number,
  fileType: string,
): boolean => {
  if (fileType.startsWith("image/")) {
    return fileSize <= FILE_SIZE_LIMITS.MAX_IMAGE_SIZE;
  }
  if (fileType.startsWith("video/")) {
    return fileSize <= FILE_SIZE_LIMITS.MAX_VIDEO_SIZE;
  }
  return fileSize <= FILE_SIZE_LIMITS.MAX_FILE_SIZE;
};

export const getFileSizeLimit = (fileType: string): number => {
  if (fileType.startsWith("image/")) {
    return FILE_SIZE_LIMITS.MAX_IMAGE_SIZE;
  }
  if (fileType.startsWith("video/")) {
    return FILE_SIZE_LIMITS.MAX_VIDEO_SIZE;
  }
  return FILE_SIZE_LIMITS.MAX_FILE_SIZE;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};
