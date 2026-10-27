import { Router, Request, Response, NextFunction } from 'express';
import { query } from '../../database/pool.js';
import { sendSuccess } from '../../utils/response.js';

const router = Router();

router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await query(
      `SELECT s.id, s.name, s.description, s.icon, COUNT(d.id)::int as doctor_count
       FROM specializations s
       LEFT JOIN doctors d ON d.specialization_id = s.id AND d.active_status = TRUE
       GROUP BY s.id
       ORDER BY s.name ASC`
    );
    sendSuccess(res, result.rows);
  } catch (error) {
    next(error);
  }
});

export default router;
