import { Router } from 'express';
import {
  bookAppointment,
  getAppointments,
  getAppointmentById,
  rescheduleAppointment,
  cancelAppointment,
  updateAppointmentStatus,
} from './appointments.controller.js';
import { requireAuth } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import {
  bookAppointmentSchema,
  rescheduleAppointmentSchema,
  cancelAppointmentSchema,
  updateStatusSchema,
} from './appointments.schema.js';

const router = Router();

router.use(requireAuth);

router.post('/', validate(bookAppointmentSchema), bookAppointment);
router.get('/', getAppointments);
router.get('/:id', getAppointmentById);
router.post('/:id/reschedule', validate(rescheduleAppointmentSchema), rescheduleAppointment);
router.post('/:id/cancel', validate(cancelAppointmentSchema), cancelAppointment);
router.patch('/:id/status', validate(updateStatusSchema), updateAppointmentStatus);

export default router;
