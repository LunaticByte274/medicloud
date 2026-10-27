import request from 'supertest';
import { app } from '../src/app.js';
import { pool, query } from '../src/database/pool.js';

describe('Appointments & Concurrency Safety API', () => {
  let patientToken: string;
  let testSlotId: string;
  const doctorId = '44444444-4444-4444-4444-444444444401'; // Dr. Marcus Vance

  beforeAll(async () => {
    // 1. Login patient
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'sarah.jenkins@example.com', password: 'Password123!' });
    patientToken = loginRes.body.data.token;

    // 2. Insert fresh test slot in future
    const slotRes = await query(
      `INSERT INTO doctor_availability (doctor_id, start_at, end_at, availability_status)
       VALUES ($1, CURRENT_TIMESTAMP + INTERVAL '10 days 10 hours', CURRENT_TIMESTAMP + INTERVAL '10 days 10 hours 45 mins', 'AVAILABLE')
       RETURNING id`,
      [doctorId]
    );
    testSlotId = slotRes.rows[0].id;
  });

  afterAll(async () => {
    // Clean up test slot and appointment
    if (testSlotId) {
      await query(`DELETE FROM appointments WHERE availability_id = $1`, [testSlotId]);
      await query(`DELETE FROM doctor_availability WHERE id = $1`, [testSlotId]);
    }
    await pool.end();
  });

  it('books an available slot successfully', async () => {
    const res = await request(app)
      .post('/api/v1/appointments')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({
        doctorId,
        availabilityId: testSlotId,
        reasonCategory: 'Cardiology Checkup',
        notes: 'Routine test consultation',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.availability_id).toBe(testSlotId);
    expect(res.body.data.status).toBe('BOOKED');
  });

  it('PREVENTS double booking on the same slot (Returns 409 Conflict)', async () => {
    // Attempting to book the same slot again
    const res = await request(app)
      .post('/api/v1/appointments')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({
        doctorId,
        availabilityId: testSlotId,
        reasonCategory: 'Duplicate Attempt',
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('CONFLICT');
  });

  it('lists appointments scoped to the authenticated patient', async () => {
    const res = await request(app)
      .get('/api/v1/appointments')
      .set('Authorization', `Bearer ${patientToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });
});
