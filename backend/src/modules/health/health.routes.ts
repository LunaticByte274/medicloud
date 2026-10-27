import { Router, Request, Response } from 'express';
import { query } from '../../database/pool.js';
import { config } from '../../config/index.js';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  const start = Date.now();
  let dbStatus = 'DOWN';
  let dbLatencyMs = 0;

  try {
    const dbRes = await query('SELECT 1 as ping');
    if (dbRes.rows[0]?.ping === 1) {
      dbStatus = 'UP';
      dbLatencyMs = Date.now() - start;
    }
  } catch (err) {
    dbStatus = 'DOWN';
  }

  const memoryUsage = process.memoryUsage();

  const healthData = {
    status: dbStatus === 'UP' ? 'HEALTHY' : 'DEGRADED',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    environment: config.env,
    cloudMode: config.aws.useLocalCloudMocks ? 'LOCAL_EMULATION' : 'AWS_NATIVE',
    database: {
      status: dbStatus,
      latencyMs: dbLatencyMs,
    },
    system: {
      nodeVersion: process.version,
      memoryRssMb: Math.round(memoryUsage.rss / 1024 / 1024),
      memoryHeapUsedMb: Math.round(memoryUsage.heapUsed / 1024 / 1024),
    },
  };

  const statusCode = dbStatus === 'UP' ? 200 : 503;
  res.status(statusCode).json(healthData);
});

export default router;
