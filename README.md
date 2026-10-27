# MediCloud — Cloud-Based Healthcare Appointment, Medical Document Processing & Notification Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-v20%2B-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue.svg)](https://www.postgresql.org/)
[![AWS](https://img.shields.io/badge/AWS-EC2%20%7C%20RDS%20%7C%20S3%20%7C%20SQS%20%7C%20SNS%20%7C%20CloudWatch-orange.svg)](https://aws.amazon.com/)

---

## 1. Executive Summary

**MediCloud** is a comprehensive, production-grade cloud computing mini project developed for third-year Computer Engineering students. It delivers an end-to-end healthcare workflow platform encompassing:
- **Patient Portal:** Doctor discovery by specialization, conflict-free appointment scheduling, rescheduling, cancellation, synthetic medical document upload, and status tracking.
- **Doctor Portal:** Availability slot management, assigned appointments overview, status updates, authorized document access, and prescription attachment.
- **Administrator Portal:** User management, doctor onboarding, system-wide appointment oversight, asynchronous document processing queue monitoring, real operational analytics, and audit logging.
- **AWS Cloud Native Foundation:** Deployed on Amazon EC2 inside a custom VPC with public and private subnets, backed by Amazon RDS PostgreSQL, Amazon S3 private document store, Amazon SQS asynchronous processing worker, Amazon SNS notifications, AWS Systems Manager Parameter Store, and Amazon CloudWatch monitoring/alarms.

> **EDUCATIONAL PROTOTYPE NOTICE:** MediCloud processes **strictly synthetic healthcare data**. It is an educational prototype and does not provide real clinical advice or medical diagnosis.

---

## 2. Architecture Overview

```mermaid
flowchart TD
    subgraph Internet ["Public Internet"]
        User["Patient / Doctor / Admin"]
    end

    subgraph AWS_VPC ["Custom Amazon VPC (10.0.0.0/16)"]
        subgraph Public_Subnets ["Public Subnets (10.0.1.0/24, 10.0.2.0/24)"]
            IGW["Internet Gateway"]
            ALB["Application Load Balancer"]
        end

        subgraph Private_App_Subnets ["Private Application Subnets (10.0.10.0/24)"]
            EC2_APP["EC2 Instance (Node.js/Express API + Vite Static UI)"]
            EC2_WORKER["Background Processing Worker"]
        end

        subgraph Private_DB_Subnets ["Private Database Subnets (10.0.20.0/24, 10.0.21.0/24)"]
            RDS_PG[("Amazon RDS PostgreSQL")]
        end
    end

    subgraph AWS_Services ["AWS Managed Services"]
        S3_DOCS[("Amazon S3 (Private Bucket)")]
        SQS_QUEUE["Amazon SQS (Document Jobs Queue)"]
        SQS_DLQ["Amazon SQS Dead-Letter Queue"]
        SNS_NOTIF["Amazon SNS (Notifications Topic)"]
        SSM_PARAM["AWS SSM Parameter Store"]
        CW_LOGS["Amazon CloudWatch Logs & Metrics"]
        CW_ALARM["CloudWatch Alarms"]
        AWS_BUDGET["AWS Budgets ($15 Threshold)"]
    end

    User -->|HTTPS :443| IGW
    IGW --> ALB
    ALB -->|HTTP :5000| EC2_APP
    EC2_APP -->|TCP :5432| RDS_PG
    EC2_APP -->|Presigned Put/Get| S3_DOCS
    EC2_APP -->|Enqueue Job| SQS_QUEUE
    SQS_QUEUE -->|Poll Messages| EC2_WORKER
    EC2_WORKER -->|Failed Retries > 3| SQS_DLQ
    EC2_WORKER -->|Fetch & OCR Document| S3_DOCS
    EC2_WORKER -->|Update Status| RDS_PG
    EC2_APP -->|Publish Events| SNS_NOTIF
    EC2_WORKER -->|Publish Results| SNS_NOTIF
    EC2_APP -.->|Fetch Secrets on Boot| SSM_PARAM
    EC2_APP -.->|Stream Logs & Metrics| CW_LOGS
    CW_LOGS -.-> CW_ALARM
```

---

## 3. Technology Stack

| Domain | Technology | Purpose |
|---|---|---|
| **Frontend** | React 18, Vite, TypeScript | Modern reactive SPA interface |
| **Styling** | Vanilla CSS Tokens & Modules | High-aesthetic light/dark mode design system |
| **Icons** | Lucide React | Clean, accessible iconography |
| **Backend** | Node.js (v20+ LTS), Express.js, TypeScript | RESTful API server with centralized middleware |
| **Validation** | Zod | Runtime schema validation for all requests |
| **Database** | PostgreSQL 16 (Local) / Amazon RDS (Cloud) | ACID-compliant relational persistence |
| **Compute** | Amazon EC2 (`t3.micro` / `t4g.micro`) | Non-serverless primary compute host |
| **Storage** | Amazon S3 | Private encrypted document store with Presigned URLs |
| **Messaging** | Amazon SQS + Dead-Letter Queue | Decoupled asynchronous document processing |
| **Notifications**| Amazon SNS | Multi-channel broadcast & operational alerts |
| **Secrets** | AWS Systems Manager Parameter Store | Secure runtime configuration (`SecureString`) |
| **Monitoring** | Amazon CloudWatch & AWS Budgets | Structured logs, custom metrics, and spending alarms |

---

## 4. Quickstart Guide (Local Development)

### Prerequisites
- Node.js v20+ & npm 10+
- Docker & Docker Compose (for PostgreSQL)

### Step 1: Clone and Configure Environment
```bash
git clone <repo-url> medicloud
cd medicloud
cp .env.example .env
```

### Step 2: Start Local Database
```bash
docker compose up -d postgres
```

### Step 3: Setup Backend
```bash
cd backend
npm install
npm run db:migrate
npm run db:seed
npm run dev
```
Backend runs at `http://localhost:5000`.

### Step 4: Setup Frontend
```bash
cd ../frontend
npm install
npm run dev
```
Frontend runs at `http://localhost:5173`.

---

## 5. Seed Demo Accounts

| Role | Email | Password | Permissions |
|---|---|---|---|
| **Patient** | `sarah.jenkins@example.com` | `Password123!` | Book, reschedule, upload documents, view notifications |
| **Doctor** | `dr.marcus.vance@example.com` | `Password123!` | Manage availability, confirm appointments, review reports |
| **Admin** | `admin.elena@example.com` | `Password123!` | Onboard doctors, system monitoring, audit logs, analytics |

---

## 6. Project Layout

```
medicloud/
├── frontend/               # React + Vite TypeScript SPA
├── backend/                # Express TypeScript REST API & Worker
├── database/               # SQL migrations, seeds, and diagrams
├── cloud/                  # CloudFormation/Terraform IaC templates
│   ├── networking/         # VPC, Subnets, IGW, Security Groups
│   ├── deployment/         # EC2 UserData, RDS PostgreSQL templates
│   ├── iam/                # Least-privilege IAM policies
│   ├── monitoring/         # CloudWatch alarms and metrics
│   └── cost/               # AWS Budgets configuration
├── docs/                   # Academic report, architecture, API docs, viva
└── evidence/               # Test outputs, screenshots, cost calculations
```
