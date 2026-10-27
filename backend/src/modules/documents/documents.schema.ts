import { z } from 'zod';

export const requestPresignedUrlSchema = z.object({
  originalFilename: z.string().min(3).max(255),
  contentType: z.string().refine((val) => ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'].includes(val), {
    message: 'Allowed content types are application/pdf, image/jpeg, and image/png',
  }),
  fileSize: z.number().positive().max(10485760, 'Maximum allowed file size is 10 MB'),
  documentType: z.enum(['LAB_REPORT', 'PRESCRIPTION', 'DISCHARGE_SUMMARY', 'INSURANCE', 'OTHER']),
  doctorId: z.string().uuid().optional(),
  appointmentId: z.string().uuid().optional(),
});

export const confirmUploadSchema = z.object({
  documentId: z.string().uuid(),
});
