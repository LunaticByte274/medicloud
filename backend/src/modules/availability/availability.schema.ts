import { z } from 'zod';

export const createSlotSchema = z.object({
  doctorId: z.string().uuid().optional(), // Inferred from auth user if doctor
  startAt: z.string().datetime({ message: 'startAt must be a valid ISO-8601 datetime' }),
  endAt: z.string().datetime({ message: 'endAt must be a valid ISO-8601 datetime' }),
}).refine((data) => new Date(data.endAt) > new Date(data.startAt), {
  message: 'endAt must be strictly after startAt',
  path: ['endAt'],
}).refine((data) => new Date(data.startAt) > new Date(), {
  message: 'startAt must be in the future',
  path: ['startAt'],
});
