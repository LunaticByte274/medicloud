import request from 'supertest';
import { app } from '../src/app.js';

describe('Doctor Availability API', () => {
  const drAlexChenId = '44444444-4444-4444-4444-444444444403';

  it('fetches available slots for a doctor without enum type errors', async () => {
    const res = await request(app)
      .get(`/api/v1/availability/doctor/${drAlexChenId}?status=AVAILABLE`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    res.body.data.forEach((slot: any) => {
      expect(slot.availability_status).toBe('AVAILABLE');
      expect(slot.doctor_id).toBe(drAlexChenId);
    });
  });

  it('fetches all slots for a doctor with status=ALL', async () => {
    const res = await request(app)
      .get(`/api/v1/availability/doctor/${drAlexChenId}?status=ALL`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
