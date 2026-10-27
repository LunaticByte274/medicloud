import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors.js';
import { sendError } from '../utils/response.js';
import { logger } from '../utils/logger.js';
import { config } from '../config/index.js';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.error(`[AppError ${err.errorCode}] ${err.message}`, { path: req.path, method: req.method, stack: err.stack });
    } else {
      logger.warn(`[ClientError ${err.errorCode}] ${err.message}`, { path: req.path, method: req.method, details: err.details });
    }
    sendError(res, err.message, err.statusCode, err.errorCode, err.details);
    return;
  }

  // Handle Multer upload errors
  if (err.name === 'MulterError') {
    logger.warn(`[MulterError] ${err.message}`, { path: req.path });
    sendError(res, `File upload error: ${err.message}`, 400, 'UPLOAD_ERROR');
    return;
  }

  // Handle unexpected syntax errors / JSON parsing errors
  if ('type' in err && (err as any).type === 'entity.parse.failed') {
    sendError(res, 'Invalid JSON payload received in request body', 400, 'INVALID_JSON');
    return;
  }

  // Unhandled internal server error
  logger.error(`[Unhandled Server Error] ${err.message}`, {
    path: req.path,
    method: req.method,
    stack: err.stack,
  });

  const message = config.env === 'production' ? 'An unexpected internal error occurred' : err.message;
  sendError(res, message, 500, 'INTERNAL_SERVER_ERROR');
}
