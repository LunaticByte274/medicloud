import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';
import { query } from '../database/pool.js';

let snsClient: SNSClient | null = null;

function getSNSClient(): SNSClient {
  if (!snsClient) {
    snsClient = new SNSClient({ region: config.aws.region });
  }
  return snsClient;
}

export interface NotificationEvent {
  eventType:
    | 'APPOINTMENT_BOOKED'
    | 'APPOINTMENT_CONFIRMED'
    | 'APPOINTMENT_CANCELLED'
    | 'APPOINTMENT_RESCHEDULED'
    | 'DOCUMENT_PROCESSED_SUCCESS'
    | 'DOCUMENT_PROCESSED_FAILED'
    | 'SYSTEM_ALERT';
  userId: string;
  title: string;
  message: string;
  relatedAppointmentId?: string;
  relatedDocumentId?: string;
  metadata?: Record<string, any>;
}

/**
 * Publish notification event to Amazon SNS and persist in PostgreSQL notifications table
 */
export async function publishNotificationEvent(event: NotificationEvent): Promise<void> {
  // 1. Always record in local PostgreSQL notifications table for immediate UI retrieval
  try {
    await query(
      `INSERT INTO notifications (user_id, event_type, title, message, related_appointment_id, related_document_id)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        event.userId,
        event.eventType,
        event.title,
        event.message,
        event.relatedAppointmentId || null,
        event.relatedDocumentId || null,
      ]
    );
  } catch (dbErr) {
    logger.error('Failed to persist notification in database:', dbErr);
  }

  // 2. Publish to Amazon SNS topic if in production / AWS mode
  if (config.aws.useLocalCloudMocks) {
    logger.info(`[Mock SNS Event] Type: ${event.eventType} | To User: ${event.userId} | "${event.title} - ${event.message}"`);
    return;
  }

  try {
    const client = getSNSClient();
    const command = new PublishCommand({
      TopicArn: config.aws.snsTopicArn,
      Subject: `MediCloud Notification: ${event.title}`,
      Message: JSON.stringify({
        default: event.message,
        eventType: event.eventType,
        userId: event.userId,
        timestamp: new Date().toISOString(),
        metadata: event.metadata || {},
      }),
      MessageStructure: 'json',
      MessageAttributes: {
        EventType: {
          DataType: 'String',
          StringValue: event.eventType,
        },
        UserId: {
          DataType: 'String',
          StringValue: event.userId,
        },
      },
    });

    const response = await client.send(command);
    logger.info(`[AWS SNS] Published event "${event.eventType}" to SNS Topic (MessageId: ${response.MessageId})`);
  } catch (error) {
    logger.error(`Failed to publish event to SNS Topic:`, error);
  }
}
