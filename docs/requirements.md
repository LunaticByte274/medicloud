# MediCloud — Requirements Traceability & Compliance Matrix

This document maps all college requirements, functional specifications, and architectural constraints into trackable requirement identifiers (REQ-IDs), implementation tasks, verification methods, and evidence paths.

---

## 1. College Mandatory Requirements (Section 2)

| REQ-ID | Requirement Description | Implementation Mapping | Verification Strategy | Status |
|---|---|---|---|---|
| **REQ-COL-01** | Working frontend, backend, and database | React+Vite, Express API, PostgreSQL/RDS | End-to-end integration test & UI execution | IN PROGRESS |
| **REQ-COL-02** | Main application/backend runs on Amazon EC2 or container compute | EC2 UserData / Dockerized service on EC2 | Systemd status / HTTP curl on public IP | NOT STARTED (Cloud) |
| **REQ-COL-03** | Serverless-only architecture is PROHIBITED | Express Node.js service on EC2 | Architecture audit & infrastructure inspection | COMPLETED (Design) |
| **REQ-COL-04** | Custom Amazon VPC is mandatory | `cloud/networking/vpc.tf` & CloudFormation | VPC ID, CIDR verification via AWS CLI | READY TO DEPLOY |
| **REQ-COL-05** | Subnets (public/private), Route Tables, IGW, Security Groups | Public Web subnets, Private App & DB subnets | AWS CLI describe subnets & route tables | READY TO DEPLOY |
| **REQ-COL-06** | Managed database (Amazon RDS for PostgreSQL) | RDS instance in private DB subnet group | Connection test from EC2, DB status Available | READY TO DEPLOY |
| **REQ-COL-07** | Amazon S3 with genuine application purpose | Medical document storage (reports/prescriptions) | Presigned upload, encrypted S3 object, RDS ref | IMPLEMENTED |
| **REQ-COL-08** | IAM roles & policies follow least privilege | EC2 Instance Profile with scoped S3, SQS, SNS, SSM | Policy evaluation & permission boundary test | IMPLEMENTED |
| **REQ-COL-09** | Zero hardcoded AWS access keys/secrets in code | IAM Instance Profile + SSM Parameter Store | Git repo truffleHog/grep scan for AWS keys | VERIFIED |
| **REQ-COL-10** | DB credentials & runtime config in SSM Parameter Store | AWS SSM SecureString parameters | Node.js SSM loader integration test | IMPLEMENTED |
| **REQ-COL-11** | CloudWatch collects application/cloud logs & metrics | CloudWatch Winston transport & system metrics | CloudWatch Log Streams & metric dashboards | IMPLEMENTED |
| **REQ-COL-12** | At least one meaningful monitoring alarm configured | High Queue Backlog / CPU Utilization Alarm | Trigger simulated alarm threshold | READY TO DEPLOY |
| **REQ-COL-13** | AWS Budgets configured for spending alerts | AWS Budgets resource definition ($15/mo alert) | Budget creation verification | READY TO DEPLOY |
| **REQ-COL-14** | At least five cloud services genuinely integrated | EC2, VPC, RDS, S3, SQS, SNS, SSM, CloudWatch | Active API interaction tests | IN PROGRESS |
| **REQ-COL-15** | At least two additional cloud capabilities | SQS Asynchronous Worker + SNS Notifications | SQS message consumption & SNS dispatch tests | IMPLEMENTED |
| **REQ-COL-16** | Lambda/API Gateway only support, not replace EC2 | Main API strictly on EC2 | Architecture compliance audit | COMPLETED |
| **REQ-COL-17** | Documented functional purpose for every service | `docs/aws-services.md` justification table | College documentation review | COMPLETED |
| **REQ-COL-18** | Substantially more than basic CRUD | Async OCR worker, conflict-free booking, RBAC | Feature verification suite | IMPLEMENTED |
| **REQ-COL-19** | S3-only / static-only site strictly prohibited | Dynamic Node.js/PostgreSQL application | End-to-end dynamic workflow test | COMPLETED |
| **REQ-COL-20** | Demonstrates Compute, Network, DB, Storage, Security, Monitoring | All 6 cloud pillars verified | Viva Voce defense & test evidence | IN PROGRESS |
| **REQ-COL-21** | Deliverables: Diagrams, Cost, Code, Screenshots, Viva Q&A | `docs/` artifacts, evidence folders, report | College submission audit | IN PROGRESS |
| **REQ-COL-22** | Avoid expensive NAT Gateways / Multi-AZ RDS | Single-AZ RDS, EC2 with public IP/IGW route | Cost breakdown analysis (<$20/mo) | COMPLETED |
| **REQ-COL-23** | Clean shutdown & teardown procedures | `cloud/deployment/teardown.sh` script | Resource deletion verification | IMPLEMENTED |
| **REQ-COL-24** | Synthetic healthcare data only (No real patient data) | Faker/Synthetic medical seeds | Privacy review of seeds & docs | COMPLETED |

---

## 2. Functional Requirements

### 2.1 Patient Module
- **REQ-PAT-01:** Patient registration with normalized email & password hashing (Argon2id/bcrypt).
- **REQ-PAT-02:** Patient login, JWT issuance, profile viewing and editing.
- **REQ-PAT-03:** Doctor discovery: search by name, filter by specialization, view qualifications and bio.
- **REQ-PAT-04:** Appointment booking: select slot, check availability, transaction-safe booking preventing double booking.
- **REQ-PAT-05:** Appointment lifecycle: view upcoming, past, reschedule, and cancel.
- **REQ-PAT-06:** Medical document upload: upload synthetic report/prescription, validate file size (<10MB) and MIME type.
- **REQ-PAT-07:** Document processing status tracking: Uploaded -> Queued -> Processing -> Completed / Failed.
- **REQ-PAT-08:** View processed results (extracted text, metadata) without exposing raw bucket URLs.
- **REQ-PAT-09:** Notifications: view real-time notifications, mark as read, jump to relevant appointment/document.

### 2.2 Doctor Module
- **REQ-DOC-01:** Secure doctor authentication & protected dashboard.
- **REQ-DOC-02:** Availability management: create, view, edit, remove slots; validate future timestamps and prevent overlapping slots.
- **REQ-DOC-03:** Appointment management: view assigned appointments, filter by date and status, update status (CONFIRMED, COMPLETED, CANCELLED).
- **REQ-DOC-04:** Document access: access documents only for assigned appointments/patients.
- **REQ-DOC-05:** Prescription/Report upload: attach synthetic prescription or consultation note to appointment.
- **REQ-DOC-06:** Schedule overview: summary of today's schedule and metrics.

### 2.3 Administrator Module
- **REQ-ADM-01:** User management: list users, filter by role, activate/deactivate accounts.
- **REQ-ADM-02:** Doctor onboarding: create doctor profiles, assign specializations.
- **REQ-ADM-03:** Appointment monitoring: system-wide appointment oversight and audit trail.
- **REQ-ADM-04:** Document processing operations: monitor queue status, view failed jobs, trigger controlled retry.
- **REQ-ADM-05:** Operational Analytics: calculate real aggregates (Total appointments, completed, cancellation rate, doctor utilization, top specializations, queue backlog).
- **REQ-ADM-06:** Audit Trail: inspect security events, state changes, and administrative actions without logging secrets.

---

## 3. UI/UX & Design Requirements
- **REQ-UI-01:** Consistent color palette (Light: `#F5F8FC`, `#FFFFFF`, `#2563EB`, `#0F766E`; Dark: `#0B1220`, `#111B2E`, `#18243A`, `#818CF8`, `#2DD4BF`).
- **REQ-UI-02:** Functional light/dark mode switch persisted in `localStorage`.
- **REQ-UI-03:** Responsive layouts for Desktop, Tablet, and Mobile without horizontal overflow.
- **REQ-UI-04:** Accessible form controls, visible focus indicators, WCAG 2.2 AA compliant contrast.
- **REQ-UI-05:** Role-based application shell with dedicated sidebars for Patient, Doctor, and Admin.
- **REQ-UI-06:** Skeletons, loading spinners, empty states, and toast notifications for all async operations.
