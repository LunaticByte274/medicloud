import { Request, Response, NextFunction } from 'express';
import { query } from '../../database/pool.js';
import { sendSuccess } from '../../utils/response.js';
import { BadRequestError, ForbiddenError, NotFoundError, ConflictError } from '../../utils/errors.js';

export async function getDoctorAvailability(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { doctorId } = req.params;
    const { status = 'AVAILABLE' } = req.query;

    const slotsRes = await query(
      `SELECT id, doctor_id, start_at, end_at, availability_status, created_at
       FROM doctor_availability
       WHERE doctor_id = $1 
         AND ($2 = 'ALL' OR availability_status = $2)
         AND start_at >= CURRENT_TIMESTAMP - INTERVAL '1 day'
       ORDER BY start_at ASC`,
      [doctorId, status]
    );

    sendSuccess(res, slotsRes.rows);
  } catch (error) {
    next(error);
  }
}

export async function createSlot(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    let { doctorId, startAt, endAt } = req.body;

    // If the authenticated user is a doctor, use their own doctorId
    if (req.user?.role === 'DOCTOR') {
      if (!req.user.doctorId) {
        throw new ForbiddenError('Doctor profile not linked to user account');
      }
      doctorId = req.user.doctorId;
    } else if (req.user?.role !== 'ADMIN') {
      throw new ForbiddenError('Only doctors and administrators can create availability slots');
    }

    if (!doctorId) {
      throw new BadRequestError('Doctor ID is required');
    }

    // Check for overlapping slots for this doctor
    const overlapRes = await query(
      `SELECT id FROM doctor_availability
       WHERE doctor_id = $1
         AND availability_status != 'CANCELLED'
         AND (
           (start_at < $3 AND end_at > $2)
         )`,
      [doctorId, startAt, endAt]
    );

    if (overlapRes.rowCount && overlapRes.rowCount > 0) {
      throw new ConflictError('This availability slot overlaps with an existing slot for this doctor');
    }

    const insertRes = await query(
      `INSERT INTO doctor_availability (doctor_id, start_at, end_at, availability_status)
       VALUES ($1, $2, $3, 'AVAILABLE')
       RETURNING *`,
      [doctorId, startAt, endAt]
    );

    sendSuccess(res, insertRes.rows[0], 'Availability slot created', 201);
  } catch (error) {
    next(error);
  }
}

export async function deleteSlot(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;

    // Check slot
    const slotRes = await query(
      `SELECT da.*, d.user_id as doctor_user_id
       FROM doctor_availability da
       JOIN doctors d ON d.id = da.doctor_id
       WHERE da.id = $1`,
      [id]
    );

    if (slotRes.rowCount === 0) {
      throw new NotFoundError('Availability slot not found');
    }

    const slot = slotRes.rows[0];

    // Enforce authorization
    if (req.user?.role === 'DOCTOR' && slot.doctor_user_id !== req.user.id) {
      throw new ForbiddenError('You can only delete your own availability slots');
    }

    if (slot.availability_status === 'BOOKED') {
      throw new ConflictError('Cannot delete a slot that already has a booked appointment. Please cancel the appointment first.');
    }

    await query(`DELETE FROM doctor_availability WHERE id = $1`, [id]);
    sendSuccess(res, null, 'Availability slot removed successfully');
  } catch (error) {
    next(error);
  }
}
