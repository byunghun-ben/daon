import { Router } from "express";
import { UploadController } from "../controllers/upload.controller";
import { authenticateToken } from "../middleware/auth";

const router = Router();

router.use(authenticateToken);

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
