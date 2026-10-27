import dotenv from 'dotenv';
import path from 'path';

// Load .env from project root or current directory
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
dotenv.config();

export interface AppConfig {
  env: string;
  port: number;
  frontendUrl: string;
  db: {
    host: string;
    port: number;
    name: string;
    user: string;
    password: string;
    ssl: boolean;
    url?: string;
  };
  jwt: {
    secret: string;
    expiresIn: string;
    refreshSecret: string;
    refreshExpiresIn: string;
  };
  aws: {
    region: string;
    useLocalCloudMocks: boolean;
    s3BucketName: string;
    s3UploadMaxBytes: number;
    sqsQueueUrl: string;
    sqsDlqUrl: string;
    snsTopicArn: string;
    enableTextract: boolean;
    ssmParameterPath: string;
    enableCloudWatchLogs: boolean;
    cloudWatchLogGroup: string;
  };
  logging: {
    level: string;
  };
}

export const config: AppConfig = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5001', 10),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    name: process.env.DB_NAME || 'medicloud_db',
    user: process.env.DB_USER || 'medicloud_user',
    password: process.env.DB_PASSWORD || 'medicloud_secure_dev_password',
    ssl: process.env.DB_SSL === 'true',
    url: process.env.DATABASE_URL,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'medicloud_dev_jwt_secret_key_minimum_32_characters_long_for_security',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    refreshSecret: process.env.REFRESH_TOKEN_SECRET || 'medicloud_dev_refresh_secret_key_minimum_32_chars',
    refreshExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
  },
  aws: {
    region: process.env.AWS_REGION || 'us-east-1',
    useLocalCloudMocks: process.env.USE_LOCAL_CLOUD_MOCKS !== 'false',
    s3BucketName: process.env.AWS_S3_BUCKET_NAME || 'medicloud-documents-dev-bucket',
    s3UploadMaxBytes: parseInt(process.env.AWS_S3_UPLOAD_MAX_BYTES || '10485760', 10), // 10MB
    sqsQueueUrl: process.env.AWS_SQS_QUEUE_URL || 'https://sqs.us-east-1.amazonaws.com/123456789012/medicloud-document-jobs',
    sqsDlqUrl: process.env.AWS_SQS_DLQ_URL || 'https://sqs.us-east-1.amazonaws.com/123456789012/medicloud-document-jobs-dlq',
    snsTopicArn: process.env.AWS_SNS_TOPIC_ARN || 'arn:aws:sns:us-east-1:123456789012:medicloud-notifications-topic',
    enableTextract: process.env.ENABLE_AWS_TEXTRACT === 'true',
    ssmParameterPath: process.env.SSM_PARAMETER_PATH || '/medicloud/production/',
    enableCloudWatchLogs: process.env.ENABLE_CLOUDWATCH_LOGS === 'true',
    cloudWatchLogGroup: process.env.CLOUDWATCH_LOG_GROUP || '/medicloud/application',
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
};
