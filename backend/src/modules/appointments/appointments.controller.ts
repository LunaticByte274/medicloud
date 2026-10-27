import { Request, Response, NextFunction } from 'express';
import { query, withTransaction } from '../../database/pool.js';
import { sendSuccess } from '../../utils/response.js';
import { NotFoundError, ForbiddenError, ConflictError, BadRequestError } from '../../utils/errors.js';
import { publishNotificationEvent } from '../../services/sns.js';
import { logger } from '../../utils/logger.js';

export async function bookAppointment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user || req.user.role !== 'PATIENT' || !req.user.patientId) {
      throw new ForbiddenError('Only registered patients can book appointments');
    }

    const patientId = req.user.patientId;
    const { doctorId, availabilityId, reasonCategory, notes } = req.body;

    const appointment = await withTransaction(async (client) => {
      // 1. Pessimistic row-level lock on the availability slot to prevent double-booking
      const slotRes = await client.query(
        `SELECT id, doctor_id, start_at, end_at, availability_status
         FROM doctor_availability
         WHERE id = $1
         FOR UPDATE`,
        [availabilityId]
      );

      if (slotRes.rowCount === 0) {
        throw new NotFoundError('Selected availability slot does not exist');
      }

      const slot = slotRes.rows[0];

      if (slot.doctor_id !== doctorId) {
        throw new BadRequestError('Availability slot does not belong to the selected doctor');
      }

      if (slot.availability_status !== 'AVAILABLE') {
        throw new ConflictError('This appointment slot has already been booked by another user');
      }

      if (new Date(slot.start_at) < new Date()) {
        throw new BadRequestError('Cannot book an appointment slot in the past');
      }

      // 2. Mark the slot as BOOKED
      await client.query(
        `UPDATE doctor_availability 
         SET availability_status = 'BOOKED', updated_at = CURRENT_TIMESTAMP 
         WHERE id = $1`,
        [availabilityId]
      );

      // 3. Insert the appointment record
      const apptRes = await client.query(
        `INSERT INTO appointments (
           patient_id, doctor_id, availability_id, start_at, end_at, status, reason_category, notes
         )
         VALUES ($1, $2, $3, $4, $5, 'BOOKED', $6, $7)
         RETURNING *`,
        [patientId, doctorId, availabilityId, slot.start_at, slot.end_at, reasonCategory, notes || null]
      );
      const newAppt = apptRes.rows[0];

      // 4. Record audit log
      await client.query(
        `INSERT INTO audit_logs (actor_user_id, action, resource_type, resource_id, outcome, safe_metadata)
         VALUES ($1, 'APPOINTMENT_BOOKED', 'APPOINTMENT', $2, 'SUCCESS', $3)`,
        [req.user!.id, newAppt.id, JSON.stringify({ doctorId, availabilityId })]
      );

      return newAppt;
    });

    // 5. Look up doctor's user_id for notifications
    const docUserRes = await query(`SELECT user_id FROM doctors WHERE id = $1`, [doctorId]);
    const doctorUserId = docUserRes.rows[0]?.user_id;

    // Dispatch SNS & in-app notification to patient
    await publishNotificationEvent({
      eventType: 'APPOINTMENT_BOOKED',
      userId: req.user.id,
      title: 'Appointment Booked',
      message: `Your appointment has been successfully scheduled for ${new Date(appointment.start_at).toLocaleString()}.`,
      relatedAppointmentId: appointment.id,
    });

    // Dispatch notification to doctor
    if (doctorUserId) {
      await publishNotificationEvent({
        eventType: 'APPOINTMENT_BOOKED',
        userId: doctorUserId,
        title: 'New Patient Appointment',
        message: `${req.user.name} scheduled a new consultation for ${new Date(appointment.start_at).toLocaleString()}.`,
        relatedAppointmentId: appointment.id,
      });
    }

    logger.info(`Appointment booked: ${appointment.id} by patient ${patientId} with doctor ${doctorId}`);
    sendSuccess(res, appointment, 'Appointment booked successfully', 201);
  } catch (error) {
    next(error);
  }
}

export async function getAppointments(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new ForbiddenError();
    const { status, page = '1', limit = '10' } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const offset = (pageNum - 1) * limitNum;

    const params: any[] = [];
    const conditions: string[] = [];

    // Role-based scoping
    if (req.user.role === 'PATIENT') {
      params.push(req.user.patientId);
      conditions.push(`a.patient_id = $${params.length}`);
    } else if (req.user.role === 'DOCTOR') {
      params.push(req.user.doctorId);
      conditions.push(`a.doctor_id = $${params.length}`);
    }

    if (status && status !== 'ALL') {
      params.push(status);
      conditions.push(`a.status = $${params.length}`);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const countRes = await query(
      `SELECT COUNT(a.id)::int as total FROM appointments a ${whereClause}`,
      params
    );
    const total = countRes.rows[0]?.total || 0;

    const dataParams = [...params, limitNum, offset];
    const dataRes = await query(
      `SELECT a.*,
              pu.name as patient_name, pu.email as patient_email, p.phone as patient_phone,
              du.name as doctor_name, du.email as doctor_email,
              s.name as specialization_name, d.consultation_fee
       FROM appointments a
       JOIN patients p ON p.id = a.patient_id
       JOIN users pu ON pu.id = p.user_id
       JOIN doctors d ON d.id = a.doctor_id
       JOIN users du ON du.id = d.user_id
       JOIN specializations s ON s.id = d.specialization_id
       ${whereClause}
       ORDER BY a.start_at DESC
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

export async function getAppointmentById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;

    const apptRes = await query(
      `SELECT a.*,
              pu.name as patient_name, pu.email as patient_email, p.phone as patient_phone, p.blood_group,
              du.name as doctor_name, du.email as doctor_email,
              s.name as specialization_name, d.consultation_fee, d.qualification
       FROM appointments a
       JOIN patients p ON p.id = a.patient_id
       JOIN users pu ON pu.id = p.user_id
       JOIN doctors d ON d.id = a.doctor_id
       JOIN users du ON du.id = d.user_id
       JOIN specializations s ON s.id = d.specialization_id
       WHERE a.id = $1`,
      [id]
    );

    if (apptRes.rowCount === 0) {
      throw new NotFoundError('Appointment not found');
    }

    const appt = apptRes.rows[0];

    // Enforce ownership
    if (req.user?.role === 'PATIENT' && appt.patient_id !== req.user.patientId) {
      throw new ForbiddenError('You can only view your own appointments');
    }
    if (req.user?.role === 'DOCTOR' && appt.doctor_id !== req.user.doctorId) {
      throw new ForbiddenError('You can only view appointments assigned to you');
    }

    // Attach documents linked to this appointment
    const docsRes = await query(
      `SELECT id, document_type, original_filename, processing_status, uploaded_at
       FROM medical_documents
       WHERE appointment_id = $1`,
      [id]
    );
    appt.documents = docsRes.rows;

    sendSuccess(res, appt);
  } catch (error) {
    next(error);
  }
}

export async function rescheduleAppointment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { newAvailabilityId } = req.body;

    const updated = await withTransaction(async (client) => {
      // 1. Lock existing appointment
      const apptRes = await client.query(`SELECT * FROM appointments WHERE id = $1 FOR UPDATE`, [id]);
      if (apptRes.rowCount === 0) throw new NotFoundError('Appointment not found');
      const appt = apptRes.rows[0];

      // Ownership check
      if (req.user?.role === 'PATIENT' && appt.patient_id !== req.user.patientId) {
        throw new ForbiddenError('You can only reschedule your own appointments');
      }

      if (['COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(appt.status)) {
        throw new BadRequestError(`Cannot reschedule an appointment in ${appt.status} status`);
      }

      // 2. Lock new slot
      const newSlotRes = await client.query(
        `SELECT * FROM doctor_availability WHERE id = $1 FOR UPDATE`,
        [newAvailabilityId]
      );
      if (newSlotRes.rowCount === 0) throw new NotFoundError('New availability slot does not exist');
      const newSlot = newSlotRes.rows[0];

      if (newSlot.doctor_id !== appt.doctor_id) {
        throw new BadRequestError('New slot must belong to the same doctor');
      }
      if (newSlot.availability_status !== 'AVAILABLE') {
        throw new ConflictError('The selected new slot is no longer available');
      }

      // 3. Restore old slot to AVAILABLE
      await client.query(
        `UPDATE doctor_availability SET availability_status = 'AVAILABLE', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [appt.availability_id]
      );

      // 4. Mark new slot as BOOKED
      await client.query(
        `UPDATE doctor_availability SET availability_status = 'BOOKED', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [newAvailabilityId]
      );

      // 5. Update appointment
      const updateRes = await client.query(
        `UPDATE appointments 
         SET availability_id = $1, start_at = $2, end_at = $3, updated_at = CURRENT_TIMESTAMP
         WHERE id = $4
         RETURNING *`,
        [newAvailabilityId, newSlot.start_at, newSlot.end_at, id]
      );

      return updateRes.rows[0];
    });

    await publishNotificationEvent({
      eventType: 'APPOINTMENT_RESCHEDULED',
      userId: req.user!.id,
      title: 'Appointment Rescheduled',
      message: `Your appointment has been rescheduled to ${new Date(updated.start_at).toLocaleString()}.`,
      relatedAppointmentId: updated.id,
    });

    sendSuccess(res, updated, 'Appointment rescheduled successfully');
  } catch (error) {
    next(error);
  }
}

export async function cancelAppointment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { cancellationReason } = req.body;

    const cancelled = await withTransaction(async (client) => {
      const apptRes = await client.query(`SELECT * FROM appointments WHERE id = $1 FOR UPDATE`, [id]);
      if (apptRes.rowCount === 0) throw new NotFoundError('Appointment not found');
      const appt = apptRes.rows[0];

      if (req.user?.role === 'PATIENT' && appt.patient_id !== req.user.patientId) {
        throw new ForbiddenError('You can only cancel your own appointments');
      }
      if (req.user?.role === 'DOCTOR' && appt.doctor_id !== req.user.doctorId) {
        throw new ForbiddenError('You can only cancel appointments assigned to you');
      }

      if (appt.status === 'CANCELLED') {
        throw new BadRequestError('Appointment is already cancelled');
      }

      // 1. Release the slot back to AVAILABLE
      await client.query(
        `UPDATE doctor_availability 
         SET availability_status = 'AVAILABLE', updated_at = CURRENT_TIMESTAMP 
         WHERE id = $1`,
        [appt.availability_id]
      );

      // 2. Mark appointment CANCELLED
      const updateRes = await client.query(
        `UPDATE appointments 
         SET status = 'CANCELLED', cancelled_at = CURRENT_TIMESTAMP, cancellation_reason = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2
         RETURNING *`,
        [cancellationReason, id]
      );

      // 3. Audit log
      await client.query(
        `INSERT INTO audit_logs (actor_user_id, action, resource_type, resource_id, outcome, safe_metadata)
         VALUES ($1, 'APPOINTMENT_CANCELLED', 'APPOINTMENT', $2, 'SUCCESS', $3)`,
        [req.user!.id, id, JSON.stringify({ reason: cancellationReason })]
      );

      return updateRes.rows[0];
    });

    await publishNotificationEvent({
      eventType: 'APPOINTMENT_CANCELLED',
      userId: req.user!.id,
      title: 'Appointment Cancelled',
      message: `Appointment for ${new Date(cancelled.start_at).toLocaleString()} was cancelled. Reason: ${cancellationReason}`,
      relatedAppointmentId: cancelled.id,
    });

    sendSuccess(res, cancelled, 'Appointment cancelled successfully');
  } catch (error) {
    next(error);
  }
}

export async function updateAppointmentStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const apptRes = await query(`SELECT * FROM appointments WHERE id = $1`, [id]);
    if (apptRes.rowCount === 0) throw new NotFoundError('Appointment not found');
    const appt = apptRes.rows[0];

    // Doctors and Admins can update status
    if (req.user?.role === 'DOCTOR' && appt.doctor_id !== req.user.doctorId) {
      throw new ForbiddenError('You can only update appointments assigned to you');
    }

    const updateRes = await query(
      `UPDATE appointments 
       SET status = $1, notes = COALESCE($2, notes), updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [status, notes || null, id]
    );

    sendSuccess(res, updateRes.rows[0], `Appointment marked as ${status}`);
  } catch (error) {
    next(error);
  }
}
