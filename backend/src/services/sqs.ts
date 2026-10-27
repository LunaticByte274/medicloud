import {
  SQSClient,
  SendMessageCommand,
  ReceiveMessageCommand,
  DeleteMessageCommand,
} from '@aws-sdk/client-sqs';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

let sqsClient: SQSClient | null = null;

function getSQSClient(): SQSClient {
  if (!sqsClient) {
    sqsClient = new SQSClient({ region: config.aws.region });
  }
  return sqsClient;
}

export interface DocumentJobPayload {
  jobId: string;
  documentId: string;
  patientId: string;
  s3Key: string;
  documentType: string;
  attemptCount: number;
  timestamp: string;
  receiptHandle?: string;
}

// In-memory queue used for local testing when USE_LOCAL_CLOUD_MOCKS is enabled
const localQueue: DocumentJobPayload[] = [];

/**
 * Enqueue a document job for asynchronous processing
 */
export async function sendDocumentProcessingJob(payload: DocumentJobPayload): Promise<string> {
  const messageBody = JSON.stringify(payload);

  if (config.aws.useLocalCloudMocks) {
    localQueue.push({ ...payload, receiptHandle: `local_handle_${Date.now()}` });
    logger.info(`[Mock SQS] Job queued locally for document ${payload.documentId}. Total in queue: ${localQueue.length}`);
    return `mock-msg-${Date.now()}`;
  }

  try {
    const client = getSQSClient();
    const command = new SendMessageCommand({
      QueueUrl: config.aws.sqsQueueUrl,
      MessageBody: messageBody,
      MessageAttributes: {
        DocumentType: {
          DataType: 'String',
          StringValue: payload.documentType,
        },
        DocumentId: {
          DataType: 'String',
          StringValue: payload.documentId,
        },
      },
    });

    const response = await client.send(command);
    logger.info(`[AWS SQS] Sent document processing job ${payload.jobId} (MessageId: ${response.MessageId})`);
    return response.MessageId || `sqs-msg-${Date.now()}`;
  } catch (error) {
    logger.error('Failed to send SQS document job:', error);
    throw error;
  }
}

/**
 * Poll messages from the SQS queue or local queue
 */
export async function receiveDocumentJobs(maxMessages: number = 5): Promise<DocumentJobPayload[]> {
  if (config.aws.useLocalCloudMocks) {
    const jobs: DocumentJobPayload[] = [];
    while (localQueue.length > 0 && jobs.length < maxMessages) {
      const job = localQueue.shift();
      if (job) jobs.push(job);
    }
    return jobs;
  }

  try {
    const client = getSQSClient();
    const command = new ReceiveMessageCommand({
      QueueUrl: config.aws.sqsQueueUrl,
      MaxNumberOfMessages: maxMessages,
      WaitTimeSeconds: 5, // Long polling
      VisibilityTimeout: 60, // 60 seconds processing window
      MessageAttributeNames: ['All'],
    });

    const response = await client.send(command);
    if (!response.Messages || response.Messages.length === 0) {
      return [];
    }

    return response.Messages.map((msg) => {
      const payload: DocumentJobPayload = JSON.parse(msg.Body || '{}');
      payload.receiptHandle = msg.ReceiptHandle;
      return payload;
    });
  } catch (error) {
    logger.error('Failed to receive messages from SQS:', error);
    return [];
  }
}

/**
 * Acknowledge and delete processed message from SQS
 */
export async function deleteDocumentJob(receiptHandle: string): Promise<void> {
  if (config.aws.useLocalCloudMocks || receiptHandle.startsWith('local_handle_')) {
    logger.info(`[Mock SQS] Acknowledged and removed local job with receipt: ${receiptHandle}`);
    return;
  }

  try {
    const client = getSQSClient();
    const command = new DeleteMessageCommand({
      QueueUrl: config.aws.sqsQueueUrl,
      ReceiptHandle: receiptHandle,
    });
    await client.send(command);
    logger.info('[AWS SQS] Deleted message from SQS queue successfully');
  } catch (error) {
    logger.error('Failed to delete SQS message:', error);
    throw error;
  }
}

/**
 * Dead-Letter Queue (DLQ) publisher for poison pill / permanently failed jobs
 */
export async function sendToDeadLetterQueue(payload: DocumentJobPayload, reason: string): Promise<void> {
  logger.warn(`[DLQ Route] Routing job ${payload.jobId} to Dead-Letter Queue. Reason: ${reason}`);

  if (config.aws.useLocalCloudMocks) {
    return;
  }

  try {
    const client = getSQSClient();
    const command = new SendMessageCommand({
      QueueUrl: config.aws.sqsDlqUrl,
      MessageBody: JSON.stringify({ ...payload, failureReason: reason, routedAt: new Date().toISOString() }),
    });
    await client.send(command);
  } catch (error) {
    logger.error('Failed to route message to DLQ:', error);
  }
}

export function getLocalQueueLength(): number {
  return localQueue.length;
}
