import { Router } from 'express';
import { getDoctorAvailability, createSlot, deleteSlot } from './availability.controller.js';
import { requireAuth } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/rbac.js';
import { validate } from '../../middleware/validate.js';
import { createSlotSchema } from './availability.schema.js';

const router = Router();

router.get('/doctor/:doctorId', getDoctorAvailability);
router.post('/', requireAuth, requireRole('DOCTOR', 'ADMIN'), validate(createSlotSchema), createSlot);
router.delete('/:id', requireAuth, requireRole('DOCTOR', 'ADMIN'), deleteSlot);

export default router;
