export type UserRole = 'PATIENT' | 'DOCTOR' | 'ADMIN';
export type AccountStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  accountStatus: AccountStatus;
  patientId?: string;
  doctorId?: string;
  createdAt?: string;
}

export interface Specialization {
  id: string;
  name: string;
  description: string;
  icon: string;
  doctor_count?: number;
}

export interface Doctor {
  id: string;
  user_id: string;
  name: string;
  email: string;
  specialization_id: string;
  specialization_name: string;
  specialization_description?: string;
  qualification: string;
  experience_years: number;
  consultation_fee: number;
  biography: string;
  active_status: boolean;
  total_appointments?: number;
  availableSlots?: AvailabilitySlot[];
}

export interface AvailabilitySlot {
  id: string;
  doctor_id: string;
  start_at: string;
  end_at: string;
  availability_status: 'AVAILABLE' | 'BOOKED' | 'CANCELLED' | 'BLOCKED';
}

export interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  availability_id: string;
  start_at: string;
  end_at: string;
  status: 'BOOKED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  reason_category: string;
  notes?: string;
  cancelled_at?: string;
  cancellation_reason?: string;
  patient_name?: string;
  patient_email?: string;
  patient_phone?: string;
  patient_blood_group?: string;
  doctor_name?: string;
  doctor_email?: string;
  specialization_name?: string;
  consultation_fee?: number;
  qualification?: string;
  documents?: MedicalDocument[];
}

export interface MedicalDocument {
  id: string;
  patient_id: string;
  doctor_id?: string;
  appointment_id?: string;
  document_type: 'LAB_REPORT' | 'PRESCRIPTION' | 'DISCHARGE_SUMMARY' | 'INSURANCE' | 'OTHER';
  original_filename: string;
  s3_key: string;
  content_type: string;
  file_size: number;
  processing_status: 'UPLOADED' | 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  uploaded_at: string;
  updated_at: string;
  patient_name?: string;
  extracted_text?: string;
  result_metadata?: Record<string, any>;
  processed_at?: string;
}

export interface NotificationItem {
  id: string;
  event_type: string;
  title: string;
  message: string;
  related_appointment_id?: string;
  related_document_id?: string;
  read_at?: string;
  created_at: string;
}

export interface AdminAnalytics {
  appointments: {
    total: number;
    completed: number;
    upcoming: number;
    cancelled: number;
    cancellationRatePercent: number;
  };
  doctorUtilizationPercent: number;
  documents: {
    total: number;
    completed: number;
    processing: number;
    queued: number;
    failed: number;
    successRatePercent: number;
  };
  specializationDemand: Array<{
    specialization: string;
    appointment_count: number;
  }>;
  community: {
    patients: number;
    doctors: number;
  };
  timestamp: string;
}

export interface AuditLogItem {
  id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  outcome: string;
  safe_metadata: Record<string, any>;
  created_at: string;
  actor_name?: string;
  actor_email?: string;
  actor_role?: string;
}
