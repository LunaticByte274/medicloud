# MediCloud — Live Project Demonstration & Presentation Walkthrough

Follow this scripted 10-minute demonstration sequence during your viva examination.

---

### Step 1: System Overview & Architecture (2 mins)
1. Introduce the project title: **MediCloud — Cloud-Based Healthcare Appointment, Medical Document Processing & Notification Platform**.
2. Open the architecture diagram in `README.md` or `docs/architecture.md`.
3. Explain the 3-Tier non-serverless architecture:
   - Presentation tier: React 18, Vite, TypeScript SPA with Light/Dark mode.
   - Application compute tier: Node.js/Express API & SQS Worker running on Amazon EC2.
   - Storage & Persistence: Custom Amazon VPC, Amazon RDS PostgreSQL (private subnet), Amazon S3 (private encrypted bucket), Amazon SQS with DLQ, Amazon SNS, Parameter Store, CloudWatch, and AWS Budgets.

---

### Step 2: Patient Workflow & Transaction-Safe Booking (3 mins)
1. Navigate to `http://localhost:5173/login`.
2. Click the **"Patient: Sarah Jenkins"** demo pill. The credentials autofill instantly. Click **Sign In**.
3. Point out the Patient Dashboard:
   - Greeting banner, next upcoming appointment, recent documents.
4. Click **"Find Doctors"** in the sidebar:
   - Demonstrate the search bar (type "Marcus" or "Cardiology").
   - Filter by specialty pill (e.g. "Cardiology").
   - Click **"Book Consultation"** on Dr. Marcus Vance's card.
5. In the Booking Modal:
   - Select an available date/time slot.
   - Select Consultation Reason: "Diagnostic Review".
   - Click **"Confirm Appointment"**.
   - Show success confirmation! Explain how PostgreSQL row-level locking (`SELECT ... FOR UPDATE`) prevents double booking.
6. Open **"My Appointments"**: show the newly created appointment in `BOOKED` status.

---

### Step 3: Medical Document Upload & SQS Worker Processing (3 mins)
1. In the sidebar, click **"Medical Documents"**.
2. Select Document Category: **"Lab Report"**.
3. Select any sample PDF or image file (or synthetic text file).
4. Click **"Upload & Start Analysis"**:
   - Explain what happened behind the scenes:
     1. Client called `POST /documents/presigned-url`
     2. Uploaded directly to private S3 bucket via presigned PUT URL
     3. Backend recorded metadata in RDS and pushed job payload to **Amazon SQS**!
     4. Request returned in milliseconds without blocking.
5. Show the documents table:
   - Notice the status updates: `QUEUED` -> `PROCESSING` -> `COMPLETED`.
   - The autonomous SQS background worker consumed the message and performed clinical entity extraction!
6. Click **"Results"** on the completed document:
   - Show the OCR Results Modal displaying parsed findings (e.g. Hemoglobin, WBC, Lipids, or Medications) and confidence score!
7. Click **"Download"**: show the short-lived presigned download URL.

---

### Step 4: Doctor Workflow & Status Updates (1 min)
1. Click the Logout icon in the top right.
2. On the login screen, click **"Doctor: Dr. Marcus Vance"**. Click **Sign In**.
3. Show the Doctor Dashboard:
   - Doctor schedule overview, pending patient consultations.
4. Click **"Confirm"** or **"Mark Completed"** on an appointment.
5. In the sidebar, click **"Manage Availability"**:
   - Demonstrate adding a new time slot for tomorrow.
   - Show how overlapping slots are rejected by database constraints.

---

### Step 5: Administrator Operational Analytics & Cloud Governance (1 min)
1. Log out and click **"Admin: Elena Rostova"**. Click **Sign In**.
2. Show the Admin Dashboard:
   - Live KPI cards: Total Appointments, Cancellation Rate (%), Doctor Utilization (%), SQS Queue Backlog & Document Processing Success Rate.
   - Specialization Demand Distribution bars.
   - Real-time audit trail of all security and booking actions.
3. Show **"User Directory"**: demonstrate activating/suspending accounts.
4. Conclude by highlighting:
   - Least-privilege IAM policies (`MediCloud-EC2-AppRole`).
   - Secrets managed in AWS SSM Parameter Store.
   - CloudWatch alarms on SQS backlog and EC2 CPU load.
   - AWS Budgets configured for $15/month spending limit.
