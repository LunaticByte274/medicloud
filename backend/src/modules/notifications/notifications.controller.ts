import { Request, Response, NextFunction } from 'express';
import { query } from '../../database/pool.js';
import { sendSuccess } from '../../utils/response.js';
import { ForbiddenError, NotFoundError } from '../../utils/errors.js';

export async function getNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new ForbiddenError();
    const userId = req.user.id;

    const notifRes = await query(
      `SELECT id, event_type, title, message, related_appointment_id, related_document_id, read_at, created_at
       FROM notifications
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 50`,
      [userId]
    );

    const countRes = await query(
      `SELECT COUNT(id)::int as unread_count
       FROM notifications
       WHERE user_id = $1 AND read_at IS NULL`,
      [userId]
    );

    sendSuccess(res, {
      notifications: notifRes.rows,
      unreadCount: countRes.rows[0]?.unread_count || 0,
    });
  } catch (error) {
    next(error);
  }
}

export async function markAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new ForbiddenError();
    const { id } = req.params;

    const result = await query(
      `UPDATE notifications 
       SET read_at = CURRENT_TIMESTAMP 
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [id, req.user.id]
    );

    if (result.rowCount === 0) {
      throw new NotFoundError('Notification not found or access denied');
    }

    sendSuccess(res, result.rows[0], 'Notification marked as read');
  } catch (error) {
    next(error);
  }
}

export async function markAllAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new ForbiddenError();
    await query(
      `UPDATE notifications 
       SET read_at = CURRENT_TIMESTAMP 
       WHERE user_id = $1 AND read_at IS NULL`,
      [req.user.id]
    );
    sendSuccess(res, null, 'All notifications marked as read');
  } catch (error) {
    next(error);
  }
}
