import fs from 'fs';
import path from 'path';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

let s3Client: S3Client | null = null;

function getS3Client(): S3Client {
  if (!s3Client) {
    s3Client = new S3Client({
      region: config.aws.region,
    });
  }
  return s3Client;
}

// Ensure local fallback upload directory exists
const localUploadsDir = path.resolve(process.cwd(), 'scratch_uploads');
if (!fs.existsSync(localUploadsDir)) {
  fs.mkdirSync(localUploadsDir, { recursive: true });
}

export interface PresignedUrlResult {
  uploadUrl: string;
  s3Key: string;
  isMock: boolean;
}

/**
 * Generate a secure presigned upload URL or local upload endpoint
 */
export async function generatePresignedUploadUrl(
  patientId: string,
  originalFilename: string,
  contentType: string
): Promise<PresignedUrlResult> {
  const sanitizedFilename = originalFilename.replace(/[^a-zA-Z0-9._-]/g, '_');
  const timestamp = Date.now();
  const s3Key = `documents/${patientId}/${timestamp}_${sanitizedFilename}`;

  if (config.aws.useLocalCloudMocks) {
    logger.info(`[Mock S3] Generated local upload target for key: ${s3Key}`);
    return {
      uploadUrl: `/api/v1/documents/local-upload?key=${encodeURIComponent(s3Key)}`,
      s3Key,
      isMock: true,
    };
  }

  try {
    const client = getS3Client();
    const command = new PutObjectCommand({
      Bucket: config.aws.s3BucketName,
      Key: s3Key,
      ContentType: contentType,
      ServerSideEncryption: 'AES256',
    });

    const uploadUrl = await getSignedUrl(client, command, { expiresIn: 900 }); // 15 mins
    logger.info(`[AWS S3] Generated presigned upload URL for S3 key: ${s3Key}`);

    return {
      uploadUrl,
      s3Key,
      isMock: false,
    };
  } catch (error) {
    logger.error('Failed to generate S3 presigned URL:', error);
    throw error;
  }
}

/**
 * Generate a short-lived presigned download URL for authorized users
 */
export async function generatePresignedDownloadUrl(s3Key: string): Promise<string> {
  if (config.aws.useLocalCloudMocks) {
    return `/api/v1/documents/local-file/${encodeURIComponent(s3Key)}`;
  }

  try {
    const client = getS3Client();
    const command = new GetObjectCommand({
      Bucket: config.aws.s3BucketName,
      Key: s3Key,
    });

    return await getSignedUrl(client, command, { expiresIn: 300 }); // 5 mins
  } catch (error) {
    logger.error(`Failed to generate S3 presigned download URL for ${s3Key}:`, error);
    throw error;
  }
}

/**
 * Retrieve document binary buffer for OCR extraction
 */
export async function getDocumentBuffer(s3Key: string): Promise<Buffer> {
  if (config.aws.useLocalCloudMocks) {
    const filePath = path.join(localUploadsDir, s3Key.replace(/\//g, '_'));
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath);
    }
    // Return a synthetic medical sample buffer if file was created via demo seed
    return Buffer.from(`SYNTHETIC HEALTHCARE RECORD\nKey: ${s3Key}\nStatus: Verified Synthetic Report.`);
  }

  const client = getS3Client();
  const command = new GetObjectCommand({
    Bucket: config.aws.s3BucketName,
    Key: s3Key,
  });

  const response = await client.send(command);
  const streamToBuffer = async (stream: any): Promise<Buffer> => {
    const chunks: any[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks);
  };

  return streamToBuffer(response.Body);
}

/**
 * Save file locally when using mock storage mode
 */
export async function saveLocalFile(s3Key: string, buffer: Buffer): Promise<void> {
  const filePath = path.join(localUploadsDir, s3Key.replace(/\//g, '_'));
  fs.writeFileSync(filePath, buffer);
  logger.info(`[Mock S3] Saved binary file locally at: ${filePath}`);
}
