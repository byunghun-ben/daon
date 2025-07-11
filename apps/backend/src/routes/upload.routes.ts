import { UploadController } from "@/controllers/upload.controller.js";
import { authenticateToken } from "@/middleware/auth.js";
import { uploadLimiter } from "@/middleware/rateLimiter.js";
import { Router } from "express";

const router = Router();

router.use(authenticateToken);
// @ts-expect-error - express-rate-limit types are not compatible with express types
router.use(uploadLimiter);

const uploadController = new UploadController();

/**
 * @route POST /api/upload/presigned-url
 * @desc Generate presigned URL for file upload
 * @access Private
 */
router.post("/presigned-url", uploadController.generatePresignedUrl);

/**
 * @route POST /api/upload/confirm
 * @desc Confirm file upload completion
 * @access Private
 */
router.post("/confirm", uploadController.confirmUpload);

export default router;
