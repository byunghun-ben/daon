import { createAuthenticatedHandler } from "src/utils/auth-handler";
import { z } from "zod";
import { UploadService } from "../services/upload.service";
import { logger } from "../utils/logger";

// Request 유효성 검사 스키마
const PresignedUrlRequestSchema = z.object({
  fileName: z.string().min(1, "파일명은 필수입니다"),
  fileType: z.string().min(1, "파일 타입은 필수입니다"),
  fileSize: z.number().min(1, "파일 크기는 필수입니다"),
  category: z.enum(["profile", "diary", "activity", "growth"]).optional(),
});

const ConfirmUploadRequestSchema = z.object({
  fileKey: z.string().min(1, "파일 키는 필수입니다"),
});

export class UploadController {
  private uploadService: UploadService;

  constructor() {
    this.uploadService = new UploadService();
  }

  // Presigned URL 생성
  generatePresignedUrl = createAuthenticatedHandler(async (req, res) => {
    try {
      // 사용자 인증 확인
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: "인증이 필요합니다",
        });
        return;
      }

      // 요청 데이터 유효성 검사
      const validationResult = PresignedUrlRequestSchema.safeParse(req.body);
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          error: "잘못된 요청 데이터입니다",
          details: validationResult.error.errors,
        });
        return;
      }

      const { fileName, fileType, fileSize, category } = validationResult.data;

      // Presigned URL 생성
      const result = await this.uploadService.generatePresignedUrl({
        fileName,
        fileType,
        fileSize,
        userId,
        category,
      });

      logger.info("Presigned URL generated", {
        userId,
        fileName,
        fileType,
        fileSize,
        category,
        fileKey: result.fileKey,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error("Failed to generate presigned URL", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId: req.user?.id,
        body: req.body as Record<string, unknown>,
      });

      res.status(500).json({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "내부 서버 오류가 발생했습니다",
      });
    }
  });

  // 업로드 완료 확인
  confirmUpload = createAuthenticatedHandler(async (req, res) => {
    try {
      // 사용자 인증 확인
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: "인증이 필요합니다",
        });
        return;
      }

      // 요청 데이터 유효성 검사
      const validationResult = ConfirmUploadRequestSchema.safeParse(req.body);
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          error: "잘못된 요청 데이터입니다",
          details: validationResult.error.errors,
        });
        return;
      }

      const { fileKey } = validationResult.data;

      // 업로드 확인
      const result = await this.uploadService.confirmUpload(fileKey, userId);

      logger.info("Upload confirmed", {
        userId,
        fileKey,
        publicUrl: result.publicUrl,
        fileSize: result.fileInfo.size,
        contentType: result.fileInfo.contentType,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error("Failed to confirm upload", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId: req.user?.id,
        body: req.body as Record<string, unknown>,
      });

      res.status(500).json({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "내부 서버 오류가 발생했습니다",
      });
    }
  });
}
