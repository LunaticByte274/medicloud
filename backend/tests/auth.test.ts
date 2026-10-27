import request from 'supertest';
import { app } from '../src/app.js';
import { pool } from '../src/database/pool.js';

describe('Authentication API', () => {
  afterAll(async () => {
    await pool.end();
  });

  const testEmail = `test.patient.${Date.now()}@example.com`;

  it('registers a new patient successfully', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Jane Doe',
        email: testEmail,
        password: 'Password123!',
        dateOfBirth: '1995-04-12',
        gender: 'Female',
        phone: '+1-555-123-4567',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testEmail);
    expect(res.body.data.token).toBeDefined();
  });

  it('rejects registration with duplicate email', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Jane Clone',
        email: testEmail,
        password: 'Password123!',
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('CONFLICT');
  });

  it('authenticates valid credentials on login', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'sarah.jenkins@example.com',
        password: 'Password123!',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.role).toBe('PATIENT');
    expect(res.body.data.token).toBeDefined();
  });

  it('rejects login with incorrect password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'sarah.jenkins@example.com',
        password: 'WrongPassword!',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
