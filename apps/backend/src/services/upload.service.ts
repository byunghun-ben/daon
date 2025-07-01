import {
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";

interface R2Config {
  endpoint: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  region: string;
}

interface PresignedUrlRequest {
  fileName: string;
  fileType: string;
  fileSize: number;
  userId: string;
  category?: "profile" | "diary" | "activity" | "growth";
}

interface PresignedUrlResponse {
  uploadUrl: string;
  fileKey: string;
  publicUrl: string;
  expiresIn: number;
}

interface FileInfo {
  size: number;
  contentType: string;
  lastModified: Date;
  etag: string;
  metadata: Record<string, string>;
}

interface ConfirmUploadResponse {
  success: boolean;
  publicUrl: string;
  fileInfo: FileInfo;
}

export class UploadService {
  private s3Client: S3Client;
  private bucketName: string;
  private publicBaseUrl: string;

  constructor() {
    const config = this.getR2Config();

    this.s3Client = new S3Client({
      region: config.region,
      endpoint: config.endpoint,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });

    this.bucketName = config.bucketName;
    this.publicBaseUrl = `${config.endpoint}/${config.bucketName}`;
  }

  private getR2Config(): R2Config {
    const endpoint = process.env.R2_ENDPOINT;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
    const bucketName = process.env.R2_BUCKET_NAME;
    const region = process.env.R2_REGION ?? "auto";

    if (!endpoint || !accessKeyId || !secretAccessKey || !bucketName) {
      throw new Error(
        "R2 configuration is missing. Please check environment variables.",
      );
    }

    return {
      endpoint,
      accessKeyId,
      secretAccessKey,
      bucketName,
      region,
    };
  }

  private generateFileKey(
    userId: string,
    fileName: string,
    category?: string,
  ): string {
    const timestamp = Date.now();
    const randomSuffix = crypto.randomBytes(8).toString("hex");
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");

    const basePath = category ? `${category}/${userId}` : `files/${userId}`;
    return `${basePath}/${timestamp}-${randomSuffix}-${sanitizedFileName}`;
  }

  private validateFile(
    fileName: string,
    fileType: string,
    fileSize: number,
  ): void {
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "video/mp4",
      "video/quicktime",
    ];

    if (!allowedTypes.includes(fileType)) {
      throw new Error(
        `파일 형식이 지원되지 않습니다. 지원 형식: ${allowedTypes.join(", ")}`,
      );
    }

    const maxSize = 50 * 1024 * 1024; // 50MB
    if (fileSize > maxSize) {
      throw new Error("파일 크기는 50MB를 초과할 수 없습니다.");
    }
  }

  async generatePresignedUrl(
    request: PresignedUrlRequest,
  ): Promise<PresignedUrlResponse> {
    const { fileName, fileType, fileSize, userId, category } = request;

    // 파일 유효성 검사
    this.validateFile(fileName, fileType, fileSize);

    // 고유한 파일 키 생성
    const fileKey = this.generateFileKey(userId, fileName, category);

    // S3 PutObject 명령 생성
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: fileKey,
      ContentType: fileType,
      ContentLength: fileSize,
      Metadata: {
        userId,
        originalName: fileName,
        uploadedAt: new Date().toISOString(),
        category: category ?? "general",
      },
    });

    try {
      // Presigned URL 생성 (5분 유효)
      const expiresIn = 5 * 60; // 5 minutes
      const uploadUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn,
      });

      // 공개 URL 생성
      const publicUrl = `${this.publicBaseUrl}/${fileKey}`;

      return {
        uploadUrl,
        fileKey,
        publicUrl,
        expiresIn,
      };
    } catch (error) {
      console.error("Failed to generate presigned URL:", error);
      throw new Error("Presigned URL 생성에 실패했습니다.");
    }
  }

  async confirmUpload(
    fileKey: string,
    userId: string,
  ): Promise<ConfirmUploadResponse> {
    try {
      // 1. S3에서 파일 존재 확인
      const headCommand = new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: fileKey,
      });

      const headResult = await this.s3Client.send(headCommand);

      // 2. 메타데이터에서 userId 검증
      const metadataUserId = headResult.Metadata?.userid;
      if (metadataUserId !== userId) {
        throw new Error("파일 소유자가 일치하지 않습니다.");
      }

      // 3. 파일 정보 수집
      const fileInfo = {
        size: headResult.ContentLength ?? 0,
        contentType: headResult.ContentType ?? "",
        lastModified: headResult.LastModified ?? new Date(),
        etag: headResult.ETag ?? "",
        metadata: headResult.Metadata ?? {},
      };

      const publicUrl = `${this.publicBaseUrl}/${fileKey}`;

      return {
        success: true,
        publicUrl,
        fileInfo,
      };
    } catch (error) {
      console.error("Failed to confirm upload:", error);

      if (error instanceof Error) {
        if (error.name === "NotFound") {
          throw new Error("업로드된 파일을 찾을 수 없습니다.");
        }
        if (error.message.includes("파일 소유자가 일치하지 않습니다")) {
          throw error;
        }
      }

      throw new Error("파일 업로드 확인에 실패했습니다.");
    }
  }
}
