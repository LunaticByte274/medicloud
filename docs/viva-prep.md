# MediCloud — University Viva Voce Examination Defense Guide
## Complete Academic Question & Answer Handbook for Third-Year Computer Engineering Students

This handbook provides rigorous, technical answers to the most important questions the university evaluation panel and external examiner will ask during the project defense.

---

### Q1: Why was MediCloud selected as a project, and why is it not merely a basic CRUD application?
**Answer:**
A basic CRUD application only performs naive create, read, update, and delete queries on a database with no cloud integration or concurrency protection. In real-world healthcare scheduling:
1. **Concurrency Conflict Prevention:** Naive CRUD causes double-booking when multiple users click "Book" simultaneously. MediCloud implements PostgreSQL ACID transactions with row-level pessimistic locking (`SELECT ... FOR UPDATE`), guaranteeing zero double-bookings.
2. **Decoupled Asynchronous Processing:** Uploading and running OCR text extraction on heavy medical reports blocks synchronous HTTP threads. MediCloud uses Amazon SQS and an autonomous background worker to process documents asynchronously, ensuring instantaneous response times for patients.
3. **Multi-Pillar Cloud Integration:** The cloud is not decorative; MediCloud genuinely integrates all 6 pillars of the AWS Well-Architected Framework: Compute (EC2), Networking (custom VPC), Storage (S3), Database (RDS PostgreSQL), Security (IAM & SSM Parameter Store), and Monitoring (CloudWatch & AWS Budgets).

---

### Q2: Why is the main application running on Amazon EC2 rather than being completely serverless?
**Answer:**
The college mini project rubric explicitly mandates non-serverless cloud compute. Beyond the rubric:
- Healthcare systems frequently maintain persistent database connection pools, background polling daemon workers, and long-running process supervision (systemd) which incur high latency and connection exhaustion ("thundering herd" problem on PostgreSQL) in ephemeral, stateless Lambda environments.
- EC2 provides predictable pricing (750 hours/month free under AWS Free Tier) and direct control over runtime process management, operating system security hardening, and local disk buffering.

---

### Q3: Why is a custom Amazon VPC necessary instead of using the Default VPC?
**Answer:**
The AWS Default VPC has all subnets connected directly to the Internet Gateway with public routing (`0.0.0.0/0 -> IGW`), making every provisioned resource potentially reachable from the public internet.
In MediCloud:
- We designed a **Custom VPC (`10.0.0.0/16`)** with strict segmentation: Public Subnets (`10.0.1.0/24`, `10.0.2.0/24`) for the Application Load Balancer, and Isolated Private Database Subnets (`10.0.20.0/24`, `10.0.21.0/24`) for Amazon RDS PostgreSQL.
- The database subnets have **no route to the Internet Gateway**, physically isolating patient healthcare records from direct internet exposure.

---

### Q4: Explain the difference between Public Subnets, Private Subnets, Route Tables, and Security Groups in your architecture.
**Answer:**
- **Public Subnet:** A subnet whose associated route table has an explicit route pointing to an Internet Gateway (`0.0.0.0/0 -> igw-xxxx`). Resources here can receive direct internet traffic.
- **Private Subnet:** A subnet with no route to an Internet Gateway. Resources inside cannot be reached directly from the internet.
- **Route Table:** A set of routing rules (destination CIDR -> target gateway/interface) that determines where network traffic from a subnet is directed.
- **Security Group:** A stateful virtual firewall operating at the instance/ENI level. It evaluates inbound and outbound traffic rules. Because it is stateful, if an inbound request is permitted, the outbound response is automatically allowed regardless of outbound rules.

---

### Q5: How do Security Groups enforce least-privilege access across your tiers?
**Answer:**
MediCloud uses chained security groups rather than IP CIDR ranges:
1. `ALB-SecurityGroup` allows inbound HTTP/HTTPS from `0.0.0.0/0`.
2. `EC2-SecurityGroup` allows inbound HTTP on port 5000 **strictly from `ALB-SecurityGroup`**.
3. `RDS-SecurityGroup` allows inbound PostgreSQL on port 5432 **strictly from `EC2-SecurityGroup`**.
This guarantees that even if an attacker knew the private IP of the database, the network packet is dropped at the hypervisor level because it did not originate from an authorized EC2 security group member.

---

### Q6: Why is Amazon RDS PostgreSQL used instead of storing file contents directly in the database as BLOBs?
**Answer:**
Storing large binary objects (PDFs, images) directly in PostgreSQL creates severe database performance degradation:
- Database backups (`pg_dump` or snapshotting) become massive and slow.
- The PostgreSQL buffer cache becomes polluted with large binary chunks, evicting frequently queried index pages and table rows.
- Database storage (EBS gp3 on RDS) is substantially more expensive than object storage.
- **MediCloud's Hybrid Storage Model:** We store unstructured binary files in Amazon S3 (cost-effective, durable, scalable) and store structured metadata (file size, MIME type, upload timestamp, S3 object key, processing status) in RDS PostgreSQL, maintaining relational links to patients and doctors.

---

### Q7: What is the difference between IAM Roles and IAM User Access Keys, and why do you use IAM Roles on EC2?
**Answer:**
- **IAM User Access Keys (`AKIA...` & Secret Key):** Long-lived static credentials. If hardcoded into code or committed to GitHub, attackers can compromise the AWS account within minutes.
- **IAM Roles:** Grant temporary security credentials via the AWS Security Token Service (STS) that are automatically rotated every few hours.
- MediCloud attaches an **IAM Instance Profile** (`MediCloud-EC2-AppRole`) directly to the EC2 host. The AWS SDK automatically retrieves temporary credentials from the EC2 Instance Metadata Service (IMDSv2) with zero static secrets stored in code or on disk.

---

### Q8: How does AWS Systems Manager Parameter Store improve security?
**Answer:**
Sensitive runtime secrets such as the database master password, JWT signing secret, and encryption keys are stored in SSM Parameter Store as encrypted **`SecureString`** types encrypted with AWS KMS. On boot, the backend uses its least-privilege IAM permission (`ssm:GetParametersByPath`) to decrypt secrets into memory. Source code and version control contain only `.env.example` templates with zero credentials.

---

### Q9: Why is Amazon SQS used instead of processing document OCR synchronously?
**Answer:**
If document OCR is processed synchronously in the HTTP upload handler:
1. The patient's browser must wait 5-15 seconds for OCR parsing to complete.
2. The Node.js single-threaded event loop or thread pool is blocked, causing latency spikes for other users.
3. If the server crashes mid-processing, the document upload is lost.
**With Amazon SQS:**
1. The backend stores the file in S3, enqueues a lightweight message into SQS, and returns `202 Accepted` within 180 milliseconds.
2. An autonomous background worker pulls messages from SQS, processes the document independently, and updates the database upon completion.
3. SQS provides buffering: during traffic spikes, jobs simply queue up safely without overwhelming compute resources.

---

### Q10: What is Idempotency, and how do you handle duplicate messages in SQS?
**Answer:**
Standard SQS queues guarantee **at-least-once delivery**, meaning a message may occasionally be delivered more than once.
- An **idempotent operation** produces the exact same outcome whether executed once or multiple times.
- In MediCloud, our worker uses PostgreSQL `ON CONFLICT (document_id) DO UPDATE` when inserting into `document_results`. If a duplicate message is consumed, the worker safely updates the existing record with the latest timestamp rather than creating corrupt duplicate results.

---

### Q11: What is a Dead-Letter Queue (DLQ), and why is it configured?
**Answer:**
A Dead-Letter Queue is a designated queue that catches messages that fail processing repeatedly (poison pills).
- We configured a Redrive Policy on `medicloud-document-jobs` with `maxReceiveCount: 3`.
- If an unparseable or corrupted file causes the worker to throw an exception 3 consecutive times, SQS automatically moves the message to `medicloud-document-jobs-dlq`.
- This prevents a single bad message from looping infinitely and blocking the processing of valid patient documents.

---

### Q12: How does Amazon SNS work in MediCloud?
**Answer:**
Amazon SNS follows the **Publish/Subscribe (Pub/Sub) pattern**.
- When an event occurs (e.g. `APPOINTMENT_BOOKED`, `DOCUMENT_PROCESSED_SUCCESS`), the backend publishes a message to the SNS topic `medicloud-notifications-topic`.
- SNS distributes that message simultaneously to multiple subscriber protocols: HTTP webhooks, Amazon SQS queues, or SMS/email to clinic staff and patients.
- Decoupling publishers from subscribers allows adding new notification channels without changing backend application code.

---

### Q13: Explain your CloudWatch monitoring and alarm configuration.
**Answer:**
- Application logs are streamed to CloudWatch Log Group `/medicloud/application` for centralized search and audit retention.
- We configured **`HighSQSQueueBacklog` Alarm**: evaluates metric `ApproximateNumberOfMessagesVisible`. If the backlog is $\ge 10$ messages for 5 minutes (indicating the background worker is stalled or overwhelmed), the alarm state changes from `OK` to `ALARM` and publishes a high-priority alert to the SNS notification topic.

---

### Q14: How does MediCloud prevent double-booking of doctor availability slots?
**Answer:**
When a patient attempts to book an appointment:
1. The backend opens a PostgreSQL transaction (`BEGIN`).
2. It executes:
   ```sql
   SELECT id, availability_status FROM doctor_availability WHERE id = $1 FOR UPDATE;
   ```
3. The `FOR UPDATE` clause places an exclusive **row-level pessimistic lock** on that slot. Any concurrent transaction attempting to read or book that slot is blocked until the first transaction finishes.
4. The backend verifies `availability_status = 'AVAILABLE'`. If already booked, it immediately executes `ROLLBACK` and returns `409 Conflict`.
5. If available, it updates the slot to `'BOOKED'`, inserts the appointment record, and executes `COMMIT`.

---

### Q15: How did you optimize and control AWS cloud costs?
**Answer:**
1. **Free Tier Utilization:** Used `t3.micro` EC2 (750 hrs/mo free) and Single-AZ `db.t3.micro` RDS (750 hrs/mo free).
2. **NAT Gateway Avoidance:** Omitted NAT Gateway ($32.40/mo baseline) by placing EC2 in the public subnet with an elastic IP while keeping RDS strictly in the private subnet.
3. **AWS Budgets Alert:** Deployed an automated budget with an email alert triggered if actual or forecasted spending exceeds **$15/month**.
4. **Teardown Automation:** Built `cloud/deployment/teardown.sh` to cleanly delete all chargeable resources after evaluation.
