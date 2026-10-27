# MediCloud — Project Foundation & Charter

## 1. Project Overview
- **Official Project Title:** MediCloud: A Cloud-Based Healthcare Appointment, Medical Document Processing and Notification Platform
- **Short Name:** MediCloud
- **Category:** Cloud Computing Mini Project (Third-Year Computer Engineering)
- **Primary Architecture Model:** Monolithic 3-Tier Architecture on AWS Compute (EC2) with Cloud-native managed backing services (RDS, S3, SQS, SNS, Parameter Store, CloudWatch, VPC).
- **Core Educational Objective:** Demonstrate full-stack cloud computing concepts through a genuine end-to-end healthcare workflow with high visual quality, asynchronous processing, transaction-safe booking, zero hardcoded secrets, and strict least-privilege IAM controls.

## 2. Team Workstreams (5 Students)
- **Student 1 — Frontend & UI/UX:** React 18, Vite, TypeScript, responsive layout, light/dark mode, patient/doctor/admin flows, accessibility (WCAG 2.2 AA).
- **Student 2 — Backend & Security:** Node.js, Express, REST APIs, Argon2id/JWT auth, role-based access control (RBAC), validation (Zod), centralized error handling.
- **Student 3 — Database & Storage:** PostgreSQL/RDS schema, migrations, constraints, concurrency control, transaction isolation, S3 private bucket integration.
- **Student 4 — Cloud Networking & Compute:** Custom AWS VPC (Public/Private subnets), Internet Gateway, Route Tables, Security Groups, EC2 deployment, RDS connectivity.
- **Student 5 — Asynchronous Services, Monitoring & DevOps:** SQS queue & worker, DLQ, SNS notifications, CloudWatch metrics/alarms, Parameter Store, AWS Budgets, CI/CD & testing.

## 3. Synthetic Data Policy
All healthcare data, patient records, doctor profiles, availability schedules, appointments, and medical documents within this platform are **100% synthetic and fictional**. Under no circumstances should real patient or clinical data be inputted or processed. MediCloud is an educational prototype and does not provide medical diagnoses or clinical advice.
