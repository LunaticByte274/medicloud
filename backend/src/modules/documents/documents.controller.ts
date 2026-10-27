import { Request, Response, NextFunction } from 'express';
import { query, withTransaction } from '../../database/pool.js';
import {
  generatePresignedUploadUrl,
  generatePresignedDownloadUrl,
  saveLocalFile,
} from '../../services/s3.js';
import { sendDocumentProcessingJob } from '../../services/sqs.js';
import { sendSuccess } from '../../utils/response.js';
import { ForbiddenError, NotFoundError, BadRequestError } from '../../utils/errors.js';
import { logger } from '../../utils/logger.js';

export async function requestPresignedUrl(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user || req.user.role !== 'PATIENT' || !req.user.patientId) {
      throw new ForbiddenError('Only registered patients can initiate document uploads');
    }

    const patientId = req.user.patientId;
    const { originalFilename, contentType, fileSize, documentType, doctorId, appointmentId } = req.body;

    // Generate S3 presigned URL or local endpoint
    const { uploadUrl, s3Key, isMock } = await generatePresignedUploadUrl(
      patientId,
      originalFilename,
      contentType
    );

    // Record document metadata in PostgreSQL with status 'UPLOADED'
    const docRes = await query(
      `INSERT INTO medical_documents (
         patient_id, doctor_id, appointment_id, document_type, original_filename,
         s3_key, content_type, file_size, processing_status
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'UPLOADED')
       RETURNING *`,
      [
        patientId,
        doctorId || null,
        appointmentId || null,
        documentType,
        originalFilename,
        s3Key,
        contentType,
        fileSize,
      ]
    );

    const doc = docRes.rows[0];

    logger.info(`Generated presigned upload URL for document ${doc.id} (S3 key: ${s3Key})`);
    sendSuccess(
      res,
      {
        documentId: doc.id,
        uploadUrl,
        s3Key,
        isMock,
        expiresInSeconds: 900,
      },
      'Presigned upload URL generated successfully',
      201
    );
  } catch (error) {
    next(error);
  }
}

export async function confirmUpload(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { documentId } = req.body;

    const docRes = await query(`SELECT * FROM medical_documents WHERE id = $1`, [documentId]);
    if (docRes.rowCount === 0) throw new NotFoundError('Medical document record not found');
    const doc = docRes.rows[0];

    // Enforce patient ownership
    if (req.user?.role === 'PATIENT' && doc.patient_id !== req.user.patientId) {
      throw new ForbiddenError('You can only confirm uploads for your own documents');
    }

    // Atomically create processing job and enqueue to SQS
    const job = await withTransaction(async (client) => {
      // 1. Update document status to QUEUED
      await client.query(
        `UPDATE medical_documents SET processing_status = 'QUEUED', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [documentId]
      );

      // 2. Insert processing job record
      const jobRes = await client.query(
        `INSERT INTO document_processing_jobs (document_id, job_status, attempt_count)
         VALUES ($1, 'QUEUED', 0)
         RETURNING *`,
        [documentId]
      );
      const newJob = jobRes.rows[0];

      // 3. Record audit
      await client.query(
        `INSERT INTO audit_logs (actor_user_id, action, resource_type, resource_id, outcome, safe_metadata)
         VALUES ($1, 'DOCUMENT_QUEUED', 'DOCUMENT', $2, 'SUCCESS', $3)`,
        [req.user!.id, documentId, JSON.stringify({ jobId: newJob.id, s3Key: doc.s3_key })]
      );

      return newJob;
    });

    // 4. Send asynchronous processing message to Amazon SQS
    await sendDocumentProcessingJob({
      jobId: job.id,
      documentId: doc.id,
      patientId: doc.patient_id,
      s3Key: doc.s3_key,
      documentType: doc.document_type,
      attemptCount: 0,
      timestamp: new Date().toISOString(),
    });

    logger.info(`Document ${documentId} queued for SQS background worker processing`);
    sendSuccess(res, { documentId, jobId: job.id, status: 'QUEUED' }, 'Document queued for processing', 202);
  } catch (error) {
    next(error);
  }
}

export async function getDocuments(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new ForbiddenError();
    const { status, type, page = '1', limit = '10' } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const offset = (pageNum - 1) * limitNum;

    const params: any[] = [];
    const conditions: string[] = [];

    if (req.user.role === 'PATIENT') {
      params.push(req.user.patientId);
      conditions.push(`md.patient_id = $${params.length}`);
    } else if (req.user.role === 'DOCTOR') {
      // Doctors can see documents linked to their assigned appointments or where they are doctor_id
      params.push(req.user.doctorId);
      conditions.push(`(md.doctor_id = $${params.length} OR a.doctor_id = $${params.length})`);
    }

    if (status) {
      params.push(status);
      conditions.push(`md.processing_status = $${params.length}`);
    }
    if (type) {
      params.push(type);
      conditions.push(`md.document_type = $${params.length}`);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const countRes = await query(
      `SELECT COUNT(DISTINCT md.id)::int as total 
       FROM medical_documents md
       LEFT JOIN appointments a ON a.id = md.appointment_id
       ${whereClause}`,
      params
    );
    const total = countRes.rows[0]?.total || 0;

    const dataParams = [...params, limitNum, offset];
    const dataRes = await query(
      `SELECT DISTINCT md.id, md.patient_id, md.doctor_id, md.appointment_id,
              md.document_type, md.original_filename, md.content_type, md.file_size,
              md.processing_status, md.uploaded_at, md.updated_at,
              pu.name as patient_name,
              dr.extracted_text, dr.result_metadata, dr.processed_at
       FROM medical_documents md
       JOIN patients p ON p.id = md.patient_id
       JOIN users pu ON pu.id = p.user_id
       LEFT JOIN appointments a ON a.id = md.appointment_id
       LEFT JOIN document_results dr ON dr.document_id = md.id
       ${whereClause}
       ORDER BY md.uploaded_at DESC
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

export async function getDocumentById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;

    const docRes = await query(
      `SELECT md.*,
              pu.name as patient_name, pu.email as patient_email,
              dr.extracted_text, dr.result_metadata, dr.processed_at, dr.extraction_method,
              dpj.job_status, dpj.attempt_count, dpj.safe_failure_summary
       FROM medical_documents md
       JOIN patients p ON p.id = md.patient_id
       JOIN users pu ON pu.id = p.user_id
       LEFT JOIN document_results dr ON dr.document_id = md.id
       LEFT JOIN document_processing_jobs dpj ON dpj.document_id = md.id
       WHERE md.id = $1
       ORDER BY dpj.created_at DESC
       LIMIT 1`,
      [id]
    );

    if (docRes.rowCount === 0) throw new NotFoundError('Medical document not found');
    const doc = docRes.rows[0];

    // Authorization checks
    if (req.user?.role === 'PATIENT' && doc.patient_id !== req.user.patientId) {
      throw new ForbiddenError('You can only view your own documents');
    }

    sendSuccess(res, doc);
  } catch (error) {
    next(error);
  }
}

export async function getDownloadUrl(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const docRes = await query(`SELECT * FROM medical_documents WHERE id = $1`, [id]);
    if (docRes.rowCount === 0) throw new NotFoundError('Medical document not found');
    const doc = docRes.rows[0];

    if (req.user?.role === 'PATIENT' && doc.patient_id !== req.user.patientId) {
      throw new ForbiddenError('You can only download your own documents');
    }

    const downloadUrl = await generatePresignedDownloadUrl(doc.s3_key);
    sendSuccess(res, { downloadUrl, filename: doc.original_filename });
  } catch (error) {
    next(error);
  }
}

/**
 * Fallback endpoints for local file mock uploads
 */
export async function handleLocalUpload(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const key = req.query.key as string;
    if (!key) throw new BadRequestError('Upload key parameter is required');

    const chunks: Buffer[] = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', async () => {
      const buffer = Buffer.concat(chunks);
      await saveLocalFile(key, buffer);
      sendSuccess(res, { key, size: buffer.length }, 'Local upload saved successfully');
    });
  } catch (error) {
    next(error);
  }
}

export async function serveLocalFile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const rawKey = req.params.key;
    const key = decodeURIComponent(Array.isArray(rawKey) ? rawKey[0] : rawKey);
    const { getDocumentBuffer } = await import('../../services/s3.js');
    const buffer = await getDocumentBuffer(key);

    res.setHeader('Content-Disposition', `inline; filename="${key.split('/').pop() || 'document'}"`);
    res.setHeader('Content-Type', 'application/pdf');
    res.send(buffer);
  } catch (error) {
    next(error);
  }
}
