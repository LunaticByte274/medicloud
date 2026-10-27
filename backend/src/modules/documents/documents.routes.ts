import { Router } from 'express';
import {
  requestPresignedUrl,
  confirmUpload,
  getDocuments,
  getDocumentById,
  getDownloadUrl,
  handleLocalUpload,
  serveLocalFile,
} from './documents.controller.js';
import { requireAuth } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { requestPresignedUrlSchema, confirmUploadSchema } from './documents.schema.js';

const router = Router();

// Local mock endpoints (no auth required for direct mock upload PUT)
router.put('/local-upload', handleLocalUpload);
router.get('/local-file/:key', serveLocalFile);

// Protected application routes
router.use(requireAuth);

router.post('/presigned-url', validate(requestPresignedUrlSchema), requestPresignedUrl);
router.post('/confirm-upload', validate(confirmUploadSchema), confirmUpload);
router.get('/', getDocuments);
router.get('/:id', getDocumentById);
router.get('/:id/download', getDownloadUrl);

export default router;
