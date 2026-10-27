import { z } from 'zod';

export const bookAppointmentSchema = z.object({
  doctorId: z.string().uuid('Invalid Doctor UUID'),
  availabilityId: z.string().uuid('Invalid Availability Slot UUID'),
  reasonCategory: z.string().min(2).max(100).default('General Consultation'),
  notes: z.string().max(1000).optional(),
});

export const rescheduleAppointmentSchema = z.object({
  newAvailabilityId: z.string().uuid('Invalid new Availability Slot UUID'),
});

export const cancelAppointmentSchema = z.object({
  cancellationReason: z.string().min(3, 'Please provide a cancellation reason').max(500),
});

export const updateStatusSchema = z.object({
  status: z.enum(['CONFIRMED', 'COMPLETED', 'NO_SHOW', 'CANCELLED']),
  notes: z.string().max(1000).optional(),
});
