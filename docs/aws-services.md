# MediCloud — AWS Cloud Services Justification & College Rubric Alignment

Every AWS cloud service employed in MediCloud is an integral operational component, directly satisfying the university evaluation rubric.

---

## 1. Cloud Services Justification Matrix

| AWS Service | Functional Application Purpose | College Rubric Category | Cost-Conscious Configuration | Alternative Rejected & Reason |
|---|---|---|---|---|
| **Amazon EC2** | Hosts the Node.js/Express API server, background document worker, and serves the static production build | Compute (Non-serverless core) | `t3.micro` / `t4g.micro` (AWS Free Tier eligible: 750 hrs/mo) | AWS Lambda (Prohibited by college requirement as sole compute) |
| **Amazon VPC** | Custom isolated software-defined network with public and private subnets, route tables, and security groups | Networking | Standard VPC (Free). Single AZ/IGW layout to eliminate NAT Gateway fees | Default VPC (Rejected: College explicitly mandates custom VPC) |
| **Amazon RDS for PostgreSQL** | Persists users, doctors, schedules, appointments, document metadata, audit logs, and notifications with ACID safety | Managed Database | `db.t3.micro` or `db.t4g.micro`, Single-AZ, 20GB gp3 storage | DynamoDB (NoSQL unsuitable for relational multi-table appointment constraints) |
| **Amazon S3** | Secure, private, encrypted object store for synthetic patient lab reports, prescriptions, and medical files | Storage & Document Ingestion | Standard S3 bucket with Block Public Access + AES256 server-side encryption | Local disk storage (Violates cloud statelessness; files lost on instance reboot) |
| **Amazon SQS** | Decouples user HTTP upload response from heavy document OCR processing; buffers jobs with DLQ | Additional Cloud Capability #1 (Asynchronous Processing) | Standard Queue + Dead-Letter Queue (Free Tier: 1,000,000 requests/mo) | Synchronous worker (Blocks HTTP request thread, leads to browser timeout) |
| **Amazon SNS** | Publishes event notifications for appointment confirmations, cancellations, and completed document processing | Additional Cloud Capability #2 (Event Notifications) | Standard SNS Topic with email/SMS/app subscribers (Free Tier: 1M pub/mo) | Polling-only mechanism (Inefficient, higher database load, delayed notifications) |
| **AWS Systems Manager Parameter Store** | Stores sensitive runtime secrets (JWT secret, DB password, encryption keys) as encrypted `SecureString` | Security & Secrets Management | Standard parameters (Free of charge) | Hardcoded `.env` in Git (Violates security rules, risk of credential exposure) |
| **Amazon CloudWatch** | Ingests application logs, records queue backlog metrics, CPU utilization, and fires threshold alarms | Monitoring & Observability | 10 custom metrics, 5GB log ingestion (Free Tier eligible), 1 CloudWatch Alarm | No logging / local logs only (Unmonitored infrastructure fails college rubric) |
| **AWS Budgets** | Proactively monitors project spending and dispatches email alerts if projected costs exceed $15/month | Cloud Governance & Cost Control | 2 free budgets per account configured at $15 with 85% forecast trigger | Manual bill checking (High risk of unexpected billing surprises) |
| **Amazon Textract** *(Optional enhancement)* | Extracts structured key-value pairs and text from uploaded synthetic medical documents | AI/ML Cloud Integration | Pay-per-page usage (Free Tier: 1,000 pages/month for 3 months) | Tesseract local OCR (Lacks cloud managed capability; can serve as offline fallback) |

---

## 2. Least-Privilege IAM Policy Architecture

MediCloud follows strict **least-privilege IAM principles**:
- The EC2 compute instance assumes an IAM Instance Profile: `MediCloud-EC2-AppRole`.
- Access is constrained strictly to the application's dedicated bucket, queues, topics, and parameter namespace.
- No IAM User Access Keys (`AKIA...`) are stored in code or on disk.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "S3DocumentAccess",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:AbortMultipartUpload"
      ],
      "Resource": "arn:aws:s3:::medicloud-documents-*/*"
    },
    {
      "Sid": "SQSJobQueueAccess",
      "Effect": "Allow",
      "Action": [
        "sqs:SendMessage",
        "sqs:ReceiveMessage",
        "sqs:DeleteMessage",
        "sqs:GetQueueAttributes"
      ],
      "Resource": "arn:aws:sqs:*:*:medicloud-document-jobs*"
    },
    {
      "Sid": "SNSEventPublish",
      "Effect": "Allow",
      "Action": [
        "sns:Publish"
      ],
      "Resource": "arn:aws:sns:*:*:medicloud-notifications-topic*"
    },
    {
      "Sid": "SSMParameterRead",
      "Effect": "Allow",
      "Action": [
        "ssm:GetParameter",
        "ssm:GetParameters",
        "ssm:GetParametersByPath"
      ],
      "Resource": "arn:aws:ssm:*:*:parameter/medicloud/*"
    },
    {
      "Sid": "CloudWatchLogsAccess",
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogStream",
        "logs:PutLogEvents",
        "logs:DescribeLogStreams"
      ],
      "Resource": "arn:aws:logs:*:*:log-group:/medicloud/*:*"
    }
  ]
}
```
