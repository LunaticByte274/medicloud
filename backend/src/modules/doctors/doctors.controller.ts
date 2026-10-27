import { Request, Response, NextFunction } from 'express';
import { query, withTransaction } from '../../database/pool.js';
import { sendSuccess } from '../../utils/response.js';
import { NotFoundError, BadRequestError } from '../../utils/errors.js';
import bcrypt from 'bcrypt';

export async function listDoctors(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { search, specializationId, page = '1', limit = '10' } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const offset = (pageNum - 1) * limitNum;

    const params: any[] = [];
    const conditions: string[] = ['d.active_status = TRUE', "u.account_status = 'ACTIVE'"];

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(u.name ILIKE $${params.length} OR d.qualification ILIKE $${params.length} OR d.biography ILIKE $${params.length})`);
    }

    if (specializationId) {
      params.push(specializationId);
      conditions.push(`d.specialization_id = $${params.length}`);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    // Total count query
    const countRes = await query(
      `SELECT COUNT(d.id)::int as total
       FROM doctors d
       JOIN users u ON u.id = d.user_id
       ${whereClause}`,
      params
    );
    const total = countRes.rows[0]?.total || 0;

    // Data query
    const dataParams = [...params, limitNum, offset];
    const dataRes = await query(
      `SELECT d.id, d.user_id, u.name, u.email, s.id as specialization_id, s.name as specialization_name,
              d.qualification, d.experience_years, d.consultation_fee, d.biography, d.active_status,
              COUNT(a.id)::int as total_appointments
       FROM doctors d
       JOIN users u ON u.id = d.user_id
       JOIN specializations s ON s.id = d.specialization_id
       LEFT JOIN appointments a ON a.doctor_id = d.id
       ${whereClause}
       GROUP BY d.id, u.id, s.id
       ORDER BY d.experience_years DESC, u.name ASC
       LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}`,
      dataParams
    );

    sendSuccess(res, dataRes.rows, undefined, 200, {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    next(error);
  }
}

export async function getDoctorById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;

    const docRes = await query(
      `SELECT d.id, d.user_id, u.name, u.email, s.id as specialization_id, s.name as specialization_name,
              s.description as specialization_description, d.qualification, d.experience_years,
              d.consultation_fee, d.biography, d.active_status, d.created_at
       FROM doctors d
       JOIN users u ON u.id = d.user_id
       JOIN specializations s ON s.id = d.specialization_id
       WHERE d.id = $1`,
      [id]
    );

    if (docRes.rowCount === 0) {
      throw new NotFoundError('Doctor profile not found');
    }

    const doctor = docRes.rows[0];

    // Fetch upcoming available slots
    const slotsRes = await query(
      `SELECT id, start_at, end_at, availability_status
       FROM doctor_availability
       WHERE doctor_id = $1 
         AND start_at >= CURRENT_TIMESTAMP 
         AND availability_status = 'AVAILABLE'
       ORDER BY start_at ASC
       LIMIT 30`,
      [id]
    );

    doctor.availableSlots = slotsRes.rows;

    sendSuccess(res, doctor);
  } catch (error) {
    next(error);
  }
}

export async function createDoctor(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, email, password, specializationId, qualification, experienceYears, consultationFee, biography } = req.body;

    const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rowCount && existing.rowCount > 0) {
      throw new BadRequestError('User with this email already exists');
    }

    const passwordHash = await bcrypt.hash(password || 'Password123!', 10);

    const result = await withTransaction(async (client) => {
      const userRes = await client.query(
        `INSERT INTO users (name, email, password_hash, role, account_status)
         VALUES ($1, $2, $3, 'DOCTOR', 'ACTIVE')
         RETURNING id, name, email`,
        [name, email, passwordHash]
      );
      const user = userRes.rows[0];

      const docRes = await client.query(
        `INSERT INTO doctors (user_id, specialization_id, qualification, experience_years, consultation_fee, biography)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [user.id, specializationId, qualification, experienceYears, consultationFee || 80.0, biography || '']
      );

      return {
        user,
        doctor: docRes.rows[0],
      };
    });

    sendSuccess(res, result, 'Doctor created successfully', 201);
  } catch (error) {
    next(error);
  }
}
