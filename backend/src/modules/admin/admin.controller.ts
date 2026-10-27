import { Request, Response, NextFunction } from 'express';
import { query } from '../../database/pool.js';
import { sendSuccess } from '../../utils/response.js';
import { NotFoundError, BadRequestError } from '../../utils/errors.js';
import { sendDocumentProcessingJob, getLocalQueueLength } from '../../services/sqs.js';
import { logger } from '../../utils/logger.js';

export async function getAnalytics(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // 1. Appointment statistics
    const apptStatsRes = await query(`
      SELECT 
        COUNT(*)::int as total_appointments,
        COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END)::int as completed_appointments,
        COUNT(CASE WHEN status = 'BOOKED' OR status = 'CONFIRMED' THEN 1 END)::int as upcoming_appointments,
        COUNT(CASE WHEN status = 'CANCELLED' THEN 1 END)::int as cancelled_appointments
      FROM appointments
    `);
    const apptStats = apptStatsRes.rows[0];
    const totalAppts = apptStats.total_appointments || 0;
    const cancellationRate = totalAppts > 0 
      ? Number(((apptStats.cancelled_appointments / totalAppts) * 100).toFixed(1))
      : 0;

    // 2. Doctor utilization (Booked slots vs total created slots)
    const slotStatsRes = await query(`
      SELECT 
        COUNT(*)::int as total_slots,
        COUNT(CASE WHEN availability_status = 'BOOKED' THEN 1 END)::int as booked_slots
      FROM doctor_availability
    `);
    const slotStats = slotStatsRes.rows[0];
    const doctorUtilization = slotStats.total_slots > 0
      ? Number(((slotStats.booked_slots / slotStats.total_slots) * 100).toFixed(1))
      : 0;

    // 3. Document processing metrics
    const docStatsRes = await query(`
      SELECT 
        COUNT(*)::int as total_documents,
        COUNT(CASE WHEN processing_status = 'COMPLETED' THEN 1 END)::int as completed_documents,
        COUNT(CASE WHEN processing_status = 'PROCESSING' THEN 1 END)::int as processing_documents,
        COUNT(CASE WHEN processing_status = 'QUEUED' THEN 1 END)::int as queued_documents,
        COUNT(CASE WHEN processing_status = 'FAILED' THEN 1 END)::int as failed_documents
      FROM medical_documents
    `);
    const docStats = docStatsRes.rows[0];

    // 4. Specialization demand breakdown
    const specDemandRes = await query(`
      SELECT s.name as specialization, COUNT(a.id)::int as appointment_count
      FROM specializations s
      JOIN doctors d ON d.specialization_id = s.id
      LEFT JOIN appointments a ON a.doctor_id = d.id
      GROUP BY s.id, s.name
      ORDER BY appointment_count DESC
    `);

    // 5. Total active doctors and patients
    const userStatsRes = await query(`
      SELECT 
        COUNT(CASE WHEN role = 'PATIENT' THEN 1 END)::int as total_patients,
        COUNT(CASE WHEN role = 'DOCTOR' AND account_status = 'ACTIVE' THEN 1 END)::int as total_doctors
      FROM users
    `);
    const userStats = userStatsRes.rows[0];

    const analyticsData = {
      appointments: {
        total: totalAppts,
        completed: apptStats.completed_appointments,
        upcoming: apptStats.upcoming_appointments,
        cancelled: apptStats.cancelled_appointments,
        cancellationRatePercent: cancellationRate,
      },
      doctorUtilizationPercent: doctorUtilization,
      documents: {
        total: docStats.total_documents,
        completed: docStats.completed_documents,
        processing: docStats.processing_documents,
        queued: docStats.queued_documents + getLocalQueueLength(),
        failed: docStats.failed_documents,
        successRatePercent: docStats.total_documents > 0
          ? Number(((docStats.completed_documents / docStats.total_documents) * 100).toFixed(1))
          : 100,
      },
      specializationDemand: specDemandRes.rows,
      community: {
        patients: userStats.total_patients,
        doctors: userStats.total_doctors,
      },
      timestamp: new Date().toISOString(),
    };

    sendSuccess(res, analyticsData);
  } catch (error) {
    next(error);
  }
}

export async function getAuditLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { action, limit = '25' } = req.query;
    const limitNum = parseInt(limit as string, 10);

    const params: any[] = [];
    let whereClause = '';
    if (action) {
      params.push(action);
      whereClause = `WHERE a.action = $1`;
    }

    const dataParams = [...params, limitNum];
    const logsRes = await query(
      `SELECT a.id, a.action, a.resource_type, a.resource_id, a.outcome, a.safe_metadata, a.created_at,
              u.name as actor_name, u.email as actor_email, u.role as actor_role
       FROM audit_logs a
       LEFT JOIN users u ON u.id = a.actor_user_id
       ${whereClause}
       ORDER BY a.created_at DESC
       LIMIT $${dataParams.length}`,
      dataParams
    );

    sendSuccess(res, logsRes.rows);
  } catch (error) {
    next(error);
  }
}

export async function getUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { role, status, search } = req.query;

    const params: any[] = [];
    const conditions: string[] = [];

    if (role) {
      params.push(role);
      conditions.push(`role = $${params.length}`);
    }
    if (status) {
      params.push(status);
      conditions.push(`account_status = $${params.length}`);
    }
    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(name ILIKE $${params.length} OR email ILIKE $${params.length})`);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const usersRes = await query(
      `SELECT id, name, email, role, account_status, created_at, updated_at
       FROM users
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT 100`,
      params
    );

    sendSuccess(res, usersRes.rows);
  } catch (error) {
    next(error);
  }
}

export async function updateUserStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { accountStatus } = req.body;

    if (!['ACTIVE', 'INACTIVE', 'SUSPENDED'].includes(accountStatus)) {
      throw new BadRequestError('Invalid account status');
    }

    const updateRes = await query(
      `UPDATE users SET account_status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, name, email, account_status`,
      [accountStatus, id]
    );

    if (updateRes.rowCount === 0) throw new NotFoundError('User not found');

    // Audit log
    await query(
      `INSERT INTO audit_logs (actor_user_id, action, resource_type, resource_id, outcome, safe_metadata)
       VALUES ($1, 'ADMIN_USER_STATUS_UPDATE', 'USER', $2, 'SUCCESS', $3)`,
      [req.user!.id, id, JSON.stringify({ newStatus: accountStatus })]
    );

    sendSuccess(res, updateRes.rows[0], `User status updated to ${accountStatus}`);
  } catch (error) {
    next(error);
  }
}

export async function retryFailedJob(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { jobId } = req.params;

    const jobRes = await query(
      `SELECT dpj.*, md.s3_key, md.document_type, md.patient_id
       FROM document_processing_jobs dpj
       JOIN medical_documents md ON md.id = dpj.document_id
       WHERE dpj.id = $1`,
      [jobId]
    );

    if (jobRes.rowCount === 0) throw new NotFoundError('Processing job not found');
    const job = jobRes.rows[0];

    // Reset status to QUEUED and reset attempts
    await query(
      `UPDATE document_processing_jobs 
       SET job_status = 'QUEUED', attempt_count = 0, safe_failure_summary = NULL, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [jobId]
    );
    await query(
      `UPDATE medical_documents SET processing_status = 'QUEUED', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [job.document_id]
    );

    // Re-enqueue to SQS
    await sendDocumentProcessingJob({
      jobId: job.id,
      documentId: job.document_id,
      patientId: job.patient_id,
      s3Key: job.s3_key,
      documentType: job.document_type,
      attemptCount: 0,
      timestamp: new Date().toISOString(),
    });

    logger.info(`Admin retried document processing job ${jobId}`);
    sendSuccess(res, null, 'Job re-queued for processing');
  } catch (error) {
    next(error);
  }
}
