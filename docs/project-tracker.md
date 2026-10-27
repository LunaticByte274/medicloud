# MediCloud — Master 13-Phase Project Tracker

| Task ID | Phase | Task Name | Priority | Dependencies | Status | Verification Criteria | Evidence / Artifact |
|---|---|---|---|---|---|---|---|
| **TSK-01.1** | Phase 1 | Requirements & Traceability Matrix | P0 | None | COMPLETED | Full checklist created | `docs/requirements.md` |
| **TSK-01.2** | Phase 1 | Git Repository & Directory Setup | P0 | None | COMPLETED | Clean folder hierarchy & .gitignore | Git log, directory tree |
| **TSK-01.3** | Phase 1 | Environment Template & Secrets Policy | P0 | None | COMPLETED | `.env.example` created | `.env.example` |
| **TSK-01.4** | Phase 1 | Master Tracker & Foundation Charter | P0 | None | COMPLETED | Tracker & Foundation documented | `docs/project-tracker.md` |
| **TSK-02.1** | Phase 2 | System Architecture & Service Map | P0 | TSK-01 | COMPLETED | Mermaid architecture & data flow diagrams | `docs/architecture.md` |
| **TSK-02.2** | Phase 2 | AWS Service Justification Document | P0 | TSK-02.1 | COMPLETED | College rubric justification table | `docs/aws-services.md` |
| **TSK-03.1** | Phase 3 | UI/UX Design System Tokens & Themes | P0 | TSK-01 | COMPLETED | CSS variables for Light & Dark mode | `frontend/src/styles/theme.css` |
| **TSK-03.2** | Phase 3 | Reusable UI Component Library | P0 | TSK-03.1 | COMPLETED | Accessible Buttons, Cards, Badges, Modals | `frontend/src/components/ui/` |
| **TSK-04.1** | Phase 4 | PostgreSQL Relational Schema Design | P0 | TSK-02.1 | COMPLETED | DDL migration with indexes & constraints | `database/migrations/001_initial_schema.sql` |
| **TSK-04.2** | Phase 4 | Synthetic Seed Data Generator | P0 | TSK-04.1 | COMPLETED | Realistic fictional doctors, users, slots | `database/seeds/001_seed_data.sql` |
| **TSK-04.3** | Phase 4 | Local DB Migration & Health Verification | P0 | TSK-04.2 | COMPLETED | Query tests in Postgres container | SQL verification logs |
| **TSK-05.1** | Phase 5 | Express Backend Skeleton & TypeScript Config | P0 | TSK-04 | COMPLETED | TypeScript compile, server listen | `backend/src/server.ts` |
| **TSK-05.2** | Phase 5 | Authentication & RBAC Middleware | P0 | TSK-05.1 | COMPLETED | JWT verification & role gate tests | `backend/src/middleware/auth.ts` |
| **TSK-05.3** | Phase 5 | Doctor & Availability API Endpoints | P0 | TSK-05.2 | COMPLETED | Doctor search & slot query tests | `backend/src/modules/doctors/` |
| **TSK-05.4** | Phase 5 | Appointment Transaction-Safe Booking API | P0 | TSK-05.3 | COMPLETED | Concurrency test (no double booking) | `backend/src/modules/appointments/` |
| **TSK-05.5** | Phase 5 | Medical Document Metadata API | P0 | TSK-05.4 | COMPLETED | Metadata persistence & validation | `backend/src/modules/documents/` |
| **TSK-05.6** | Phase 5 | Notifications & Admin Analytics API | P0 | TSK-05.5 | COMPLETED | Real SQL aggregation & audit logs | `backend/src/modules/admin/` |
| **TSK-06.1** | Phase 6 | React + Vite Frontend App Setup | P0 | TSK-03 | COMPLETED | Vite build, React Router, Layout shell | `frontend/src/App.tsx` |
| **TSK-06.2** | Phase 6 | Auth Screens (Login, Register, Role redirect) | P0 | TSK-06.1 | COMPLETED | Form validation & token persistence | `frontend/src/features/auth/` |
| **TSK-06.3** | Phase 6 | Patient Dashboard & Doctor Discovery Flow | P0 | TSK-06.2 | COMPLETED | Search, filter, view doctor details | `frontend/src/features/patients/` |
| **TSK-06.4** | Phase 6 | Appointment Booking, Reschedule & Cancel UI | P0 | TSK-06.3 | COMPLETED | Slot picker, confirmation modal, alerts | `frontend/src/features/appointments/` |
| **TSK-06.5** | Phase 6 | Document Upload & Status Tracker UI | P0 | TSK-06.4 | COMPLETED | Drag-and-drop, progress, OCR results | `frontend/src/features/documents/` |
| **TSK-06.6** | Phase 6 | Doctor Dashboard & Availability Management UI | P0 | TSK-06.2 | COMPLETED | Slot creation, appointment status updates | `frontend/src/features/doctors/` |
| **TSK-06.7** | Phase 6 | Admin Dashboard & Operational Analytics UI | P0 | TSK-06.2 | COMPLETED | Metric cards, audit table, user management | `frontend/src/features/admin/` |
| **TSK-07.1** | Phase 7 | AWS VPC, Subnets & Internet Gateway IaC | P0 | TSK-02 | COMPLETED | CloudFormation / Terraform IaC scripts | `cloud/networking/vpc.yaml` |
| **TSK-07.2** | Phase 7 | Security Groups Least-Privilege Rules | P0 | TSK-07.1 | COMPLETED | ALB, EC2, RDS Security Group definitions | `cloud/networking/security-groups.yaml` |
| **TSK-08.1** | Phase 8 | Amazon RDS for PostgreSQL IaC & Config | P0 | TSK-07.2 | COMPLETED | RDS Subnet group, Single-AZ, Private access | `cloud/deployment/rds.yaml` |
| **TSK-08.2** | Phase 8 | EC2 Compute Instance & UserData Deployment | P0 | TSK-08.1 | COMPLETED | CloudFormation EC2 template & user-data | `cloud/deployment/ec2.yaml` |
| **TSK-08.3** | Phase 8 | AWS SSM Parameter Store Integration | P0 | TSK-08.2 | COMPLETED | Node.js SSM Client with local fallback | `backend/src/config/ssm.ts` |
| **TSK-09.1** | Phase 9 | Amazon S3 Private Bucket & Presigned URLs | P0 | TSK-05.5 | COMPLETED | S3 client, KMS encryption, Block Public Access | `backend/src/services/s3.ts` |
| **TSK-10.1** | Phase 10 | Amazon SQS Queue & DLQ Setup | P0 | TSK-02 | COMPLETED | SQS Producer & Message Schema | `backend/src/queues/sqs.ts` |
| **TSK-10.2** | Phase 10 | Asynchronous Document Worker Service | P0 | TSK-10.1 | COMPLETED | Polling worker, OCR parser, status updater | `backend/src/workers/documentWorker.ts`|
| **TSK-11.1** | Phase 11 | Amazon SNS Notification Integration | P0 | TSK-05 | COMPLETED | SNS Publisher for appointment & doc events | `backend/src/services/sns.ts` |
| **TSK-12.1** | Phase 12 | CloudWatch Logs, Metrics & Alarm Config | P0 | TSK-05 | COMPLETED | Alarm on Queue Backlog / CPU Utilization | `cloud/monitoring/alarms.yaml` |
| **TSK-12.2** | Phase 12 | AWS Budgets Cost Control Alert ($15 threshold) | P0 | None | COMPLETED | AWS Budget definition with email alert | `cloud/cost/budget.yaml` |
| **TSK-13.1** | Phase 13 | Automated Test Suite (Unit, Integration, Security) | P0 | TSK-05, TSK-06 | COMPLETED | Jest / Vitest test runs with test reports | `backend/tests/`, `tests/` |
| **TSK-13.2** | Phase 13 | Academic Mini Project Final Report & Viva Prep | P0 | All | COMPLETED | 34-section report, viva Q&A, demo guide | `docs/final-report.md`, `docs/viva-prep.md`|
