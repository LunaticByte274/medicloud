import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query, withTransaction } from '../../database/pool.js';
import { config } from '../../config/index.js';
import { sendSuccess } from '../../utils/response.js';
import { BadRequestError, UnauthorizedError, ConflictError } from '../../utils/errors.js';
import { logger } from '../../utils/logger.js';

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, email, password, dateOfBirth, gender, phone, emergencyContact, bloodGroup, address } = req.body;

    // Check if email already registered
    const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rowCount && existing.rowCount > 0) {
      throw new ConflictError('An account with this email address already exists');
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const newUser = await withTransaction(async (client) => {
      // 1. Create User
      const userRes = await client.query(
        `INSERT INTO users (name, email, password_hash, role, account_status)
         VALUES ($1, $2, $3, 'PATIENT', 'ACTIVE')
         RETURNING id, name, email, role, created_at`,
        [name, email, passwordHash]
      );
      const user = userRes.rows[0];

      // 2. Create Patient Profile
      const patientRes = await client.query(
        `INSERT INTO patients (user_id, date_of_birth, gender, phone, emergency_contact, blood_group, address)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id`,
        [user.id, dateOfBirth || null, gender || null, phone || null, emergencyContact || null, bloodGroup || null, address || null]
      );

      // 3. Log Audit
      await client.query(
        `INSERT INTO audit_logs (actor_user_id, action, resource_type, resource_id, outcome, safe_metadata)
         VALUES ($1, 'USER_REGISTERED', 'USER', $2, 'SUCCESS', '{"role": "PATIENT"}'::jsonb)`,
        [user.id, user.id.toString()]
      );

      return {
        ...user,
        patientId: patientRes.rows[0].id,
      };
    });

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn as any }
    );

    logger.info(`User registered successfully: ${newUser.email} (${newUser.id})`);
    sendSuccess(res, { user: newUser, token }, 'Registration successful', 201);
  } catch (error) {
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body;

    const userRes = await query(
      `SELECT u.id, u.name, u.email, u.password_hash, u.role, u.account_status,
              p.id as patient_id, d.id as doctor_id, d.active_status as doctor_active
       FROM users u
       LEFT JOIN patients p ON p.user_id = u.id
       LEFT JOIN doctors d ON d.user_id = u.id
       WHERE u.email = $1`,
      [email]
    );

    if (userRes.rowCount === 0) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const user = userRes.rows[0];

    if (user.account_status !== 'ACTIVE') {
      throw new UnauthorizedError(`Account is currently ${user.account_status.toLowerCase()}`);
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      // Audit failed login attempt
      await query(
        `INSERT INTO audit_logs (actor_user_id, action, resource_type, resource_id, outcome, safe_metadata)
         VALUES ($1, 'LOGIN_FAILED', 'USER', $2, 'FAILURE', '{"reason": "INVALID_PASSWORD"}'::jsonb)`,
        [user.id, user.id.toString()]
      );
      throw new UnauthorizedError('Invalid email or password');
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn as any }
    );

    // Audit successful login
    await query(
      `INSERT INTO audit_logs (actor_user_id, action, resource_type, resource_id, outcome, safe_metadata)
       VALUES ($1, 'LOGIN_SUCCESS', 'USER', $2, 'SUCCESS', $3::jsonb)`,
      [user.id, user.id.toString(), JSON.stringify({ role: user.role })]
    );

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      patientId: user.patient_id || undefined,
      doctorId: user.doctor_id || undefined,
    };

    logger.info(`User logged in successfully: ${user.email} (${user.role})`);
    sendSuccess(res, { user: safeUser, token }, 'Login successful');
  } catch (error) {
    next(error);
  }
}

export async function getCurrentUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new UnauthorizedError();
    }

    const userRes = await query(
      `SELECT u.id, u.name, u.email, u.role, u.account_status, u.created_at,
              p.id as patient_id, p.date_of_birth, p.gender, p.phone, p.emergency_contact, p.blood_group, p.address,
              d.id as doctor_id, d.qualification, d.experience_years, d.consultation_fee, d.biography, d.active_status,
              s.name as specialization_name
       FROM users u
       LEFT JOIN patients p ON p.user_id = u.id
       LEFT JOIN doctors d ON d.user_id = u.id
       LEFT JOIN specializations s ON s.id = d.specialization_id
       WHERE u.id = $1`,
      [req.user.id]
    );

    if (userRes.rowCount === 0) {
      throw new UnauthorizedError('User not found');
    }

    sendSuccess(res, userRes.rows[0]);
  } catch (error) {
    next(error);
  }
}

export async function updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError();
    const userId = req.user.id;
    const { name, phone, emergencyContact, bloodGroup, address, biography, consultationFee } = req.body;

    await withTransaction(async (client) => {
      if (name) {
        await client.query(`UPDATE users SET name = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`, [name, userId]);
      }

      if (req.user?.role === 'PATIENT' && req.user.patientId) {
        await client.query(
          `UPDATE patients 
           SET phone = COALESCE($1, phone),
               emergency_contact = COALESCE($2, emergency_contact),
               blood_group = COALESCE($3, blood_group),
               address = COALESCE($4, address),
               updated_at = CURRENT_TIMESTAMP
           WHERE id = $5`,
          [phone || null, emergencyContact || null, bloodGroup || null, address || null, req.user.patientId]
        );
      } else if (req.user?.role === 'DOCTOR' && req.user.doctorId) {
        await client.query(
          `UPDATE doctors 
           SET biography = COALESCE($1, biography),
               consultation_fee = COALESCE($2, consultation_fee),
               updated_at = CURRENT_TIMESTAMP
           WHERE id = $3`,
          [biography || null, consultationFee || null, req.user.doctorId]
        );
      }
    });

    sendSuccess(res, null, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
}
