import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { UnauthorizedError } from '../utils/errors.js';
import { query } from '../database/pool.js';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'PATIENT' | 'DOCTOR' | 'ADMIN';
  patientId?: string;
  doctorId?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export async function requireAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Authorization header missing or invalid format (Bearer token required)');
    }

    const token = authHeader.split(' ')[1];
    let decoded: any;

    try {
      decoded = jwt.verify(token, config.jwt.secret);
    } catch (err) {
      throw new UnauthorizedError('Token is invalid or expired');
    }

    // Verify user exists and is active in DB
    const userRes = await query(
      `SELECT u.id, u.email, u.name, u.role, u.account_status,
              p.id as patient_id, d.id as doctor_id
       FROM users u
       LEFT JOIN patients p ON p.user_id = u.id
       LEFT JOIN doctors d ON d.user_id = u.id
       WHERE u.id = $1`,
      [decoded.id]
    );

    if (userRes.rowCount === 0) {
      throw new UnauthorizedError('User account not found');
    }

    const dbUser = userRes.rows[0];
    if (dbUser.account_status !== 'ACTIVE') {
      throw new UnauthorizedError(`Account is ${dbUser.account_status.toLowerCase()}`);
    }

    req.user = {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      role: dbUser.role,
      patientId: dbUser.patient_id || undefined,
      doctorId: dbUser.doctor_id || undefined,
    };

    next();
  } catch (error) {
    next(error);
  }
}
