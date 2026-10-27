import { Router } from 'express';
import { listDoctors, getDoctorById, createDoctor } from './doctors.controller.js';
import { requireAuth } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/rbac.js';

const router = Router();

router.get('/', listDoctors);
router.get('/:id', getDoctorById);
router.post('/', requireAuth, requireRole('ADMIN'), createDoctor);

export default router;
