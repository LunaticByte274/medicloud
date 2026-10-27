import { Router } from 'express';
import {
  getAnalytics,
  getAuditLogs,
  getUsers,
  updateUserStatus,
  retryFailedJob,
} from './admin.controller.js';
import { requireAuth } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/rbac.js';

const router = Router();

router.use(requireAuth);
router.use(requireRole('ADMIN'));

router.get('/analytics', getAnalytics);
router.get('/audit-logs', getAuditLogs);
router.get('/users', getUsers);
router.patch('/users/:id/status', updateUserStatus);
router.post('/jobs/:jobId/retry', retryFailedJob);

export default router;
