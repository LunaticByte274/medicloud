-- ==============================================================================
-- MEDICLOUD DATABASE SEED DATA: 001_seed_data.sql
-- All data is 100% synthetic and fictional for academic demonstration.
-- ==============================================================================

-- 1. SPECIALIZATIONS
INSERT INTO specializations (id, name, description, icon) VALUES
    ('11111111-1111-1111-1111-111111111101', 'Cardiology', 'Heart health, cardiovascular systems, hypertension, and ECG diagnostics.', 'HeartPulse'),
    ('11111111-1111-1111-1111-111111111102', 'Pediatrics', 'Comprehensive infant, child, and adolescent healthcare and developmental tracking.', 'Baby'),
    ('11111111-1111-1111-1111-111111111103', 'Dermatology', 'Skin, hair, nail disorders, biopsy analysis, and preventative oncology.', 'Sparkles'),
    ('11111111-1111-1111-1111-111111111104', 'Neurology', 'Brain and central nervous system disorders, migraine management, EEG evaluation.', 'Brain'),
    ('11111111-1111-1111-1111-111111111105', 'Orthopedics', 'Musculoskeletal system, fracture treatment, joint replacement, and mobility care.', 'Bone'),
    ('11111111-1111-1111-1111-111111111106', 'General Medicine', 'Primary care, annual health checkups, chronic disease management, and triage.', 'Stethoscope');

-- 2. USERS (Password for all accounts is: Password123!)
-- Hash generated via bcrypt: $2b$10$wTfZM7jD0E800uWzO266p.17i1E7Vf82eYmQ7kIuX.xsmC91d2XwO
-- Or dynamically using pgcrypto crypt()
INSERT INTO users (id, name, email, password_hash, role, account_status) VALUES
    -- Admin
    ('22222222-2222-2222-2222-222222222201', 'Elena Rostova', 'admin.elena@example.com', crypt('Password123!', gen_salt('bf', 10)), 'ADMIN', 'ACTIVE'),
    -- Doctors
    ('22222222-2222-2222-2222-222222222202', 'Dr. Marcus Vance', 'dr.marcus.vance@example.com', crypt('Password123!', gen_salt('bf', 10)), 'DOCTOR', 'ACTIVE'),
    ('22222222-2222-2222-2222-222222222203', 'Dr. Priya Sharma', 'dr.priya.sharma@example.com', crypt('Password123!', gen_salt('bf', 10)), 'DOCTOR', 'ACTIVE'),
    ('22222222-2222-2222-2222-222222222204', 'Dr. Alex Chen', 'dr.alex.chen@example.com', crypt('Password123!', gen_salt('bf', 10)), 'DOCTOR', 'ACTIVE'),
    ('22222222-2222-2222-2222-222222222205', 'Dr. Sarah Alvarez', 'dr.sarah.alvarez@example.com', crypt('Password123!', gen_salt('bf', 10)), 'DOCTOR', 'ACTIVE'),
    -- Patients
    ('22222222-2222-2222-2222-222222222206', 'Sarah Jenkins', 'sarah.jenkins@example.com', crypt('Password123!', gen_salt('bf', 10)), 'PATIENT', 'ACTIVE'),
    ('22222222-2222-2222-2222-222222222207', 'Michael Ross', 'michael.ross@example.com', crypt('Password123!', gen_salt('bf', 10)), 'PATIENT', 'ACTIVE'),
    ('22222222-2222-2222-2222-222222222208', 'Emily Clarke', 'emily.clarke@example.com', crypt('Password123!', gen_salt('bf', 10)), 'PATIENT', 'ACTIVE');

-- 3. PATIENTS PROFILE
INSERT INTO patients (id, user_id, date_of_birth, gender, phone, emergency_contact, blood_group, address) VALUES
    ('33333333-3333-3333-3333-333333333301', '22222222-2222-2222-2222-222222222206', '1992-05-14', 'Female', '+1-555-019-2831', 'David Jenkins (+1-555-019-2832)', 'A+', '742 Evergreen Terrace, Springfield'),
    ('33333333-3333-3333-3333-333333333302', '22222222-2222-2222-2222-222222222207', '1987-11-20', 'Male', '+1-555-018-7744', 'Rachel Zane (+1-555-018-7745)', 'O+', '350 5th Avenue, New York'),
    ('33333333-3333-3333-3333-333333333303', '22222222-2222-2222-2222-222222222208', '1995-03-08', 'Female', '+1-555-014-9922', 'James Clarke (+1-555-014-9923)', 'B-', '12 Baker Street, Boston');

-- 4. DOCTORS PROFILE
INSERT INTO doctors (id, user_id, specialization_id, qualification, experience_years, consultation_fee, biography, active_status) VALUES
    ('44444444-4444-4444-4444-444444444401', '22222222-2222-2222-2222-222222222202', '11111111-1111-1111-1111-111111111101', 'MD, FACC - Harvard Medical School', 14, 120.00, 'Board-certified cardiologist specializing in preventative cardiology, coronary artery disease management, and advanced echocardiography.', TRUE),
    ('44444444-4444-4444-4444-444444444402', '22222222-2222-2222-2222-222222222203', '11111111-1111-1111-1111-111111111102', 'MD, FAAP - Johns Hopkins University', 10, 95.00, 'Compassionate pediatrician focusing on early childhood developmental milestones, pediatric infectious diseases, and pediatric nutrition.', TRUE),
    ('44444444-4444-4444-4444-444444444403', '22222222-2222-2222-2222-222222222204', '11111111-1111-1111-1111-111111111103', 'MD - Stanford University School of Medicine', 8, 110.00, 'Dermatologist with extensive research in inflammatory skin disorders, cosmetic dermatology, and non-invasive dermatologic surgery.', TRUE),
    ('44444444-4444-4444-4444-444444444404', '22222222-2222-2222-2222-222222222205', '11111111-1111-1111-1111-111111111104', 'MD, PhD - Columbia University', 16, 150.00, 'Senior neurologist with expertise in complex neurological evaluation, neurodegenerative disorders, sleep medicine, and chronic migraines.', TRUE);

-- 5. DOCTOR AVAILABILITY SLOTS (Upcoming relative timestamps)
INSERT INTO doctor_availability (id, doctor_id, start_at, end_at, availability_status) VALUES
    -- Dr. Marcus Vance (Slots)
    ('55555555-5555-5555-5555-555555555501', '44444444-4444-4444-4444-444444444401', CURRENT_TIMESTAMP + INTERVAL '1 day 2 hours', CURRENT_TIMESTAMP + INTERVAL '1 day 2 hours 45 minutes', 'BOOKED'),
    ('55555555-5555-5555-5555-555555555502', '44444444-4444-4444-4444-444444444401', CURRENT_TIMESTAMP + INTERVAL '1 day 3 hours', CURRENT_TIMESTAMP + INTERVAL '1 day 3 hours 45 minutes', 'AVAILABLE'),
    ('55555555-5555-5555-5555-555555555503', '44444444-4444-4444-4444-444444444401', CURRENT_TIMESTAMP + INTERVAL '2 days 4 hours', CURRENT_TIMESTAMP + INTERVAL '2 days 4 hours 45 minutes', 'AVAILABLE'),
    ('55555555-5555-5555-5555-555555555504', '44444444-4444-4444-4444-444444444401', CURRENT_TIMESTAMP + INTERVAL '3 days 1 hour', CURRENT_TIMESTAMP + INTERVAL '3 days 1 hour 45 minutes', 'AVAILABLE'),
    -- Dr. Priya Sharma (Slots)
    ('55555555-5555-5555-5555-555555555505', '44444444-4444-4444-4444-444444444402', CURRENT_TIMESTAMP + INTERVAL '1 day 4 hours', CURRENT_TIMESTAMP + INTERVAL '1 day 4 hours 30 minutes', 'AVAILABLE'),
    ('55555555-5555-5555-5555-555555555506', '44444444-4444-4444-4444-444444444402', CURRENT_TIMESTAMP + INTERVAL '2 days 2 hours', CURRENT_TIMESTAMP + INTERVAL '2 days 2 hours 30 minutes', 'AVAILABLE'),
    -- Dr. Alex Chen (Slots)
    ('55555555-5555-5555-5555-555555555507', '44444444-4444-4444-4444-444444444403', CURRENT_TIMESTAMP + INTERVAL '1 day 5 hours', CURRENT_TIMESTAMP + INTERVAL '1 day 5 hours 45 minutes', 'AVAILABLE'),
    ('55555555-5555-5555-5555-555555555508', '44444444-4444-4444-4444-444444444403', CURRENT_TIMESTAMP + INTERVAL '2 days 6 hours', CURRENT_TIMESTAMP + INTERVAL '2 days 6 hours 45 minutes', 'AVAILABLE'),
    -- Dr. Sarah Alvarez (Slots)
    ('55555555-5555-5555-5555-555555555510', '44444444-4444-4444-4444-444444444404', CURRENT_TIMESTAMP + INTERVAL '1 day 3 hours', CURRENT_TIMESTAMP + INTERVAL '1 day 3 hours 45 minutes', 'AVAILABLE'),
    ('55555555-5555-5555-5555-555555555511', '44444444-4444-4444-4444-444444444404', CURRENT_TIMESTAMP + INTERVAL '2 days 5 hours', CURRENT_TIMESTAMP + INTERVAL '2 days 5 hours 45 minutes', 'AVAILABLE'),
    -- Past slot
    ('55555555-5555-5555-5555-555555555509', '44444444-4444-4444-4444-444444444401', CURRENT_TIMESTAMP - INTERVAL '5 days 2 hours', CURRENT_TIMESTAMP - INTERVAL '5 days 1 hour 15 minutes', 'BOOKED');

-- 6. APPOINTMENTS
INSERT INTO appointments (id, patient_id, doctor_id, availability_id, start_at, end_at, status, reason_category, notes) VALUES
    -- Upcoming Booked Appointment
    ('66666666-6666-6666-6666-666666666601', '33333333-3333-3333-3333-333333333301', '44444444-4444-4444-4444-444444444401', '55555555-5555-5555-5555-555555555501', CURRENT_TIMESTAMP + INTERVAL '1 day 2 hours', CURRENT_TIMESTAMP + INTERVAL '1 day 2 hours 45 minutes', 'CONFIRMED', 'Cardiology Follow-up', 'Routine checkup following mild hypertension report. Please review recent blood work.'),
    -- Past Completed Appointment
    ('66666666-6666-6666-6666-666666666602', '33333333-3333-3333-3333-333333333301', '44444444-4444-4444-4444-444444444401', '55555555-5555-5555-5555-555555555509', CURRENT_TIMESTAMP - INTERVAL '5 days 2 hours', CURRENT_TIMESTAMP - INTERVAL '5 days 1 hour 15 minutes', 'COMPLETED', 'Initial Consultation', 'Patient reported intermittent palpitation during exercise. Recommended ECG and lipid profile test.');

-- 7. MEDICAL DOCUMENTS
INSERT INTO medical_documents (id, patient_id, doctor_id, appointment_id, document_type, original_filename, s3_key, content_type, file_size, processing_status) VALUES
    ('77777777-7777-7777-7777-777777777701', '33333333-3333-3333-3333-333333333301', '44444444-4444-4444-4444-444444444401', '66666666-6666-6666-6666-666666666601', 'LAB_REPORT', 'synthetic_lipid_panel_2026.pdf', 'documents/33333333-3333-3333-3333-333333333301/synthetic_lipid_panel_2026.pdf', 'application/pdf', 245800, 'COMPLETED'),
    ('77777777-7777-7777-7777-777777777702', '33333333-3333-3333-3333-333333333301', '44444444-4444-4444-4444-444444444401', '66666666-6666-6666-6666-666666666602', 'PRESCRIPTION', 'synthetic_prescription_rx402.pdf', 'documents/33333333-3333-3333-3333-333333333301/synthetic_prescription_rx402.pdf', 'application/pdf', 112400, 'COMPLETED');

-- 8. DOCUMENT PROCESSING JOBS
INSERT INTO document_processing_jobs (id, document_id, job_status, attempt_count, started_at, completed_at) VALUES
    ('88888888-8888-8888-8888-888888888801', '77777777-7777-7777-7777-777777777701', 'COMPLETED', 1, CURRENT_TIMESTAMP - INTERVAL '2 days', CURRENT_TIMESTAMP - INTERVAL '2 days' + INTERVAL '3 seconds'),
    ('88888888-8888-8888-8888-888888888802', '77777777-7777-7777-7777-777777777702', 'COMPLETED', 1, CURRENT_TIMESTAMP - INTERVAL '5 days', CURRENT_TIMESTAMP - INTERVAL '5 days' + INTERVAL '2 seconds');

-- 9. DOCUMENT RESULTS (OCR Extracted synthetic findings)
INSERT INTO document_results (id, document_id, extraction_method, extracted_text, result_metadata) VALUES
    ('99999999-9999-9999-9999-999999999901', '77777777-7777-7777-7777-777777777701', 'SYNTHETIC_TEXTRACT_OCR', 
     'METROPOLITAN CLINICAL LABORATORIES - COMPREHENSIVE LIPID PANEL
Patient: Sarah Jenkins (Age: 34, Female)
Date of Collection: 2026-10-24
Total Cholesterol: 195 mg/dL (Reference: < 200 mg/dL - Normal)
Triglycerides: 140 mg/dL (Reference: < 150 mg/dL - Normal)
HDL Cholesterol: 58 mg/dL (Reference: > 50 mg/dL - Optimal)
LDL Cholesterol: 109 mg/dL (Reference: < 100 mg/dL - Desirable / Borderline)
Non-HDL Cholesterol: 137 mg/dL
Remarks: Lipoprotein parameters within acceptable clinical threshold. Continue regular cardiovascular exercise.',
     '{"test_type": "Lipid Panel", "cholesterol_total": 195, "hdl": 58, "ldl": 109, "triglycerides": 140, "confidence_score": 0.98}'::jsonb),

    ('99999999-9999-9999-9999-999999999902', '77777777-7777-7777-7777-777777777702', 'SYNTHETIC_TEXTRACT_OCR',
     'PRESCRIPTION RX-402
Provider: Dr. Marcus Vance, MD, FACC
Rx: CoQ10 100mg orally once daily with morning meals.
Rx: Low-dose Aspirin 81mg orally daily.
Refills: 2
Notes: Maintain hydration and follow low-sodium dietary recommendations.',
     '{"medications": [{"name": "CoQ10", "dosage": "100mg", "frequency": "Daily"}, {"name": "Aspirin", "dosage": "81mg", "frequency": "Daily"}], "confidence_score": 0.99}'::jsonb);

-- 10. NOTIFICATIONS
INSERT INTO notifications (id, user_id, event_type, title, message, related_appointment_id, related_document_id) VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', '22222222-2222-2222-2222-222222222206', 'APPOINTMENT_CONFIRMED', 'Appointment Confirmed', 'Your appointment with Dr. Marcus Vance on tomorrow has been confirmed.', '66666666-6666-6666-6666-666666666601', NULL),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', '22222222-2222-2222-2222-222222222206', 'DOCUMENT_PROCESSED', 'Medical Report Processed', 'Your document "synthetic_lipid_panel_2026.pdf" has finished OCR processing.', NULL, '77777777-7777-7777-7777-777777777701'),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', '22222222-2222-2222-2222-222222222202', 'NEW_APPOINTMENT', 'New Consultation Scheduled', 'Sarah Jenkins scheduled an appointment for tomorrow.', '66666666-6666-6666-6666-666666666601', NULL);

-- 11. AUDIT LOGS
INSERT INTO audit_logs (id, actor_user_id, action, resource_type, resource_id, outcome, safe_metadata) VALUES
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1', '22222222-2222-2222-2222-222222222206', 'APPOINTMENT_BOOKED', 'APPOINTMENT', '66666666-6666-6666-6666-666666666601', 'SUCCESS', '{"doctorId": "44444444-4444-4444-4444-444444444401", "channel": "WEB"}'::jsonb),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2', '22222222-2222-2222-2222-222222222206', 'DOCUMENT_UPLOAD', 'DOCUMENT', '77777777-7777-7777-7777-777777777701', 'SUCCESS', '{"category": "LAB_REPORT", "size": 245800}'::jsonb),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb3', '22222222-2222-2222-2222-222222222201', 'ADMIN_DOCTOR_LIST_VIEW', 'USER', 'SYSTEM', 'SUCCESS', '{"filter": "ALL"}'::jsonb);
