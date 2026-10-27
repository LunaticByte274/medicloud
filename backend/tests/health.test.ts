import request from 'supertest';
import { app } from '../src/app.js';
import { pool } from '../src/database/pool.js';

describe('Health Check API', () => {
  afterAll(async () => {
    await pool.end();
  });

  it('GET /api/v1/health returns status 200 and database UP', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('HEALTHY');
    expect(res.body.database.status).toBe('UP');
    expect(res.body.system.nodeVersion).toBeDefined();
  });

  it('GET / returns root service information', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body.service).toBe('MediCloud API');
    expect(res.body.status).toBe('ACTIVE');
  });
});
