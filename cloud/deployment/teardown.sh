#!/usr/bin/env bash
# ==============================================================================
# MEDICLOUD RESOURCE CLEANUP & TEARDOWN SCRIPT
# ==============================================================================
# CAUTION: This deletes cloud resources to eliminate charges after viva/demo.
# ==============================================================================
set -euo pipefail

REGION="${AWS_REGION:-us-east-1}"
ENV_NAME="${ENVIRONMENT_NAME:-medicloud-prod}"

echo "===================================================================="
echo " MediCloud Cloud Teardown & Cost Elimination Script"
echo " Target Environment: ${ENV_NAME} in Region: ${REGION}"
echo "===================================================================="
read -p "Are you sure you want to delete all cloud resources? (type 'yes' to proceed): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
  echo "Teardown aborted."
  exit 0
fi

# 1. Delete Alarms
echo "--> Deleting CloudWatch Alarms..."
aws cloudformation delete-stack --stack-name "${ENV_NAME}-alarms" --region "${REGION}" || true

# 2. Empty & Delete S3 Bucket
echo "--> Emptying and Deleting S3 Buckets..."
BUCKET_NAME=$(aws cloudformation describe-stacks --stack-name "${ENV_NAME}-s3" --region "${REGION}" \
  --query "Stacks[0].Outputs[?OutputKey=='BucketName'].OutputValue" --output text 2>/dev/null || true)
if [ -n "$BUCKET_NAME" ]; then
  aws s3 rm "s3://${BUCKET_NAME}" --recursive || true
fi
aws cloudformation delete-stack --stack-name "${ENV_NAME}-s3" --region "${REGION}" || true

# 3. Delete SQS & SNS
echo "--> Deleting SQS and SNS stacks..."
aws cloudformation delete-stack --stack-name "${ENV_NAME}-sqs-sns" --region "${REGION}" || true

# 4. Delete EC2 & RDS
echo "--> Deleting EC2 and RDS instances..."
aws cloudformation delete-stack --stack-name "${ENV_NAME}-ec2" --region "${REGION}" || true
aws cloudformation delete-stack --stack-name "${ENV_NAME}-rds" --region "${REGION}" || true

# 5. Delete IAM & Security Groups
echo "--> Deleting IAM Profiles and Security Groups..."
aws cloudformation delete-stack --stack-name "${ENV_NAME}-iam" --region "${REGION}" || true
aws cloudformation delete-stack --stack-name "${ENV_NAME}-security-groups" --region "${REGION}" || true

# 6. Delete VPC
echo "--> Deleting Custom VPC..."
aws cloudformation delete-stack --stack-name "${ENV_NAME}-vpc" --region "${REGION}" || true

echo "Teardown complete. All persistent chargeable resources removed."
