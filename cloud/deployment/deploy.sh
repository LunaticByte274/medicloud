#!/usr/bin/env bash
# ==============================================================================
# MEDICLOUD AWS CLOUD DEPLOYMENT AUTOMATION SCRIPT
# ==============================================================================
set -euo pipefail

REGION="${AWS_REGION:-us-east-1}"
ENV_NAME="${ENVIRONMENT_NAME:-medicloud-prod}"

echo "===================================================================="
echo " Starting MediCloud AWS Cloud Infrastructure Deployment"
echo " Region: ${REGION} | Environment: ${ENV_NAME}"
echo "===================================================================="

# 1. Deploy Custom VPC & Subnets
echo "--> [1/6] Deploying Custom VPC and Network Architecture..."
aws cloudformation deploy \
  --template-file cloud/networking/vpc.yaml \
  --stack-name "${ENV_NAME}-vpc" \
  --parameter-overrides EnvironmentName="${ENV_NAME}" \
  --region "${REGION}"

# 2. Deploy Security Groups
VPC_ID=$(aws cloudformation describe-stacks --stack-name "${ENV_NAME}-vpc" --region "${REGION}" \
  --query "Stacks[0].Outputs[?OutputKey=='VpcId'].OutputValue" --output text)

echo "--> [2/6] Deploying Least-Privilege Security Groups in VPC ${VPC_ID}..."
aws cloudformation deploy \
  --template-file cloud/networking/security-groups.yaml \
  --stack-name "${ENV_NAME}-security-groups" \
  --parameter-overrides EnvironmentName="${ENV_NAME}" VpcId="${VPC_ID}" \
  --region "${REGION}"

# 3. Deploy IAM Roles & Instance Profile
echo "--> [3/6] Provisioning Least-Privilege IAM Roles..."
aws cloudformation deploy \
  --template-file cloud/iam/iam-template.yaml \
  --stack-name "${ENV_NAME}-iam" \
  --parameter-overrides EnvironmentName="${ENV_NAME}" \
  --capabilities CAPABILITY_NAMED_IAM \
  --region "${REGION}"

# 4. Deploy S3 Document Store
echo "--> [4/6] Creating Private Encrypted S3 Document Bucket..."
aws cloudformation deploy \
  --template-file cloud/deployment/s3.yaml \
  --stack-name "${ENV_NAME}-s3" \
  --parameter-overrides EnvironmentName="${ENV_NAME}" \
  --region "${REGION}"

# 5. Deploy SQS Queue & SNS Notifications
echo "--> [5/6] Creating Amazon SQS Queue with DLQ and SNS Topic..."
aws cloudformation deploy \
  --template-file cloud/deployment/sqs-sns.yaml \
  --stack-name "${ENV_NAME}-sqs-sns" \
  --parameter-overrides EnvironmentName="${ENV_NAME}" \
  --region "${REGION}"

# 6. Deploy CloudWatch Alarms
SNS_TOPIC_ARN=$(aws cloudformation describe-stacks --stack-name "${ENV_NAME}-sqs-sns" --region "${REGION}" \
  --query "Stacks[0].Outputs[?OutputKey=='TopicArn'].OutputValue" --output text)

echo "--> [6/6] Configuring CloudWatch Alarms & Monitoring..."
aws cloudformation deploy \
  --template-file cloud/monitoring/alarms.yaml \
  --stack-name "${ENV_NAME}-alarms" \
  --parameter-overrides EnvironmentName="${ENV_NAME}" NotificationTopicArn="${SNS_TOPIC_ARN}" \
  --region "${REGION}"

echo "===================================================================="
echo " MediCloud AWS Infrastructure Deployment Succeeded!"
echo "===================================================================="

BUCKET_NAME=$(aws cloudformation describe-stacks --stack-name "${ENV_NAME}-s3" --region "${REGION}" \
  --query "Stacks[0].Outputs[?OutputKey=='BucketName'].OutputValue" --output text 2>/dev/null || echo "N/A")

QUEUE_URL=$(aws cloudformation describe-stacks --stack-name "${ENV_NAME}-sqs-sns" --region "${REGION}" \
  --query "Stacks[0].Outputs[?OutputKey=='QueueUrl'].OutputValue" --output text 2>/dev/null || echo "N/A")

SNS_ARN=$(aws cloudformation describe-stacks --stack-name "${ENV_NAME}-sqs-sns" --region "${REGION}" \
  --query "Stacks[0].Outputs[?OutputKey=='TopicArn'].OutputValue" --output text 2>/dev/null || echo "N/A")

echo ""
echo "===================================================================="
echo " COPY THESE VALUES INTO YOUR backend/.env FILE (OR SEND THEM HERE):"
echo "===================================================================="
echo "USE_LOCAL_CLOUD_MOCKS=false"
echo "AWS_REGION=${REGION}"
echo "AWS_S3_BUCKET_NAME=${BUCKET_NAME}"
echo "AWS_SQS_QUEUE_URL=${QUEUE_URL}"
echo "AWS_SNS_TOPIC_ARN=${SNS_ARN}"
echo "===================================================================="

