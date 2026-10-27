import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { Appointment, MedicalDocument } from '../../types/index.js';
import { apiRequest } from '../../lib/api.js';
import { Link } from 'react-router-dom';
import {
  Calendar,
  FileText,
  Clock,
  Search,
  UploadCloud,
  CheckCircle2,
  ArrowRight,
  HeartPulse,
  ShieldCheck,
  Activity,
  Sparkles,
  ChevronRight,
  Stethoscope,
  Lock,
} from 'lucide-react';

export const PatientDashboard: React.FC = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [documents, setDocuments] = useState<MedicalDocument[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const [apptsData, docsData] = await Promise.all([
          apiRequest<Appointment[]>('/appointments?status=BOOKED&limit=5'),
          apiRequest<MedicalDocument[]>('/documents?limit=5'),
        ]);
        setAppointments(apptsData);
        setDocuments(docsData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const nextAppointment = appointments[0];

  return (
    <div>
      {/* Hero Welcome Banner with Dynamic Mesh Gradient */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #1E40AF 0%, #2563EB 55%, #0D9488 100%)',
          color: '#FFFFFF',
          padding: '2.5rem',
          marginBottom: '2rem',
          border: 'none',
          boxShadow: '0 12px 32px -4px rgba(37, 99, 235, 0.35)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle decorative background watermarks */}
        <div
          style={{
            position: 'absolute',
            right: '-30px',
            bottom: '-40px',
            opacity: 0.1,
            pointerEvents: 'none',
          }}
        >
          <HeartPulse size={260} color="#FFFFFF" />
        </div>

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '720px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', backgroundColor: 'rgba(255, 255, 255, 0.18)', backdropFilter: 'blur(8px)', padding: '0.3rem 0.85rem', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 700, marginBottom: '1rem', letterSpacing: '0.04em' }}>
            <Sparkles size={14} />
            <span>CLINICAL WORKSPACE • PATIENT PORTAL</span>
          </div>

          <h1 style={{ fontSize: '2.25rem', color: '#FFFFFF', marginBottom: '0.5rem', fontWeight: 800 }}>
            Welcome back, {user?.name}! 👋
          </h1>
          <p style={{ opacity: 0.92, fontSize: '1rem', lineHeight: 1.6, marginBottom: '1.75rem' }}>
            Schedule consultations with board-certified physicians, upload synthetic diagnostic records directly to private encrypted Amazon S3, and track asynchronous worker processing.
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link
              to="/doctors"
              className="btn"
              style={{
                backgroundColor: '#FFFFFF',
                color: '#1D4ED8',
                fontWeight: 700,
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
                padding: '0.75rem 1.4rem',
              }}
            >
              <Search size={17} />
              <span>Find a Specialist</span>
            </Link>
            <Link
              to="/documents"
              className="btn"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.18)',
                color: '#FFFFFF',
                border: '1px solid rgba(255, 255, 255, 0.35)',
                backdropFilter: 'blur(8px)',
                padding: '0.75rem 1.4rem',
              }}
            >
              <UploadCloud size={17} />
              <span>Upload Medical Document</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Metric KPI Cards */}
      <div className="grid-metrics" style={{ marginBottom: '2rem' }}>
        <div className="card card-featured">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Active Consultations</span>
            <div style={{ width: '38px', height: '38px', borderRadius: 'var(--radius-md)', background: 'var(--primary-subtle)', color: 'var(--primary-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calendar size={18} />
            </div>
          </div>
          <div style={{ fontSize: '2.1rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
            {appointments.length}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Scheduled clinical visits
          </div>
        </div>

        <div className="card card-featured">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Medical Documents</span>
            <div style={{ width: '38px', height: '38px', borderRadius: 'var(--radius-md)', background: 'var(--teal-subtle)', color: 'var(--secondary-teal)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={18} />
            </div>
          </div>
          <div style={{ fontSize: '2.1rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
            {documents.length}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Prescriptions & lab reports
          </div>
        </div>

        <div className="card card-featured">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Amazon S3 Storage</span>
            <div style={{ width: '38px', height: '38px', borderRadius: 'var(--radius-md)', background: 'var(--success-bg)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Lock size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.25rem', marginTop: '0.35rem' }}>
            Encrypted AES256
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Zero-knowledge private bucket
          </div>
        </div>

        <div className="card card-featured">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Worker Queue (SQS)</span>
            <div style={{ width: '38px', height: '38px', borderRadius: 'var(--radius-md)', background: 'var(--info-bg)', color: 'var(--info)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary-blue)', marginBottom: '0.25rem', marginTop: '0.35rem' }}>
            Decoupled Pipeline
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Auto-retry + Dead Letter Queue
          </div>
        </div>
      </div>

      {/* Grid: Next Consultation & Quick Actions */}
      <div className="grid-2col" style={{ marginBottom: '2.5rem' }}>
        {/* Next Scheduled Appointment */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Calendar size={20} color="var(--primary-blue)" />
              <span>Next Upcoming Consultation</span>
            </h3>
            <Link to="/appointments" style={{ fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span>View all</span>
              <ChevronRight size={16} />
            </Link>
          </div>

          {loading ? (
            <p style={{ color: 'var(--text-secondary)', padding: '1.5rem 0' }}>Loading your consultation schedule...</p>
          ) : !nextAppointment ? (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-secondary)' }}>
              <Clock size={42} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
              <p style={{ fontWeight: 600 }}>No upcoming consultations scheduled.</p>
              <p style={{ fontSize: '0.85rem', marginTop: '0.25rem', color: 'var(--text-muted)' }}>
                Select a physician by clinical specialty to schedule a new visit.
              </p>
              <Link to="/doctors" className="btn btn-primary" style={{ marginTop: '1.25rem', padding: '0.55rem 1.25rem' }}>
                Book Consultation Now
              </Link>
            </div>
          ) : (
            <div
              style={{
                padding: '1.5rem',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--border-subtle)',
                border: '1px solid var(--border)',
                borderLeft: '5px solid var(--primary-blue)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-full)', background: 'var(--primary-subtle)', color: 'var(--primary-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.1rem' }}>
                    {(nextAppointment.doctor_name || 'Dr').replace('Dr. ', '').charAt(0)}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.2rem', marginBottom: '0.2rem' }}>{nextAppointment.doctor_name || 'Assigned Physician'}</h4>
                    <span className="badge badge-info">{nextAppointment.specialization_name || 'General'}</span>
                  </div>
                </div>
                <span className="badge badge-success">Confirmed</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <Calendar size={16} color="var(--primary-blue)" />
                  <span style={{ fontWeight: 600 }}>
                    {new Date(nextAppointment.start_at).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <Clock size={16} color="var(--secondary-teal)" />
                  <span style={{ fontWeight: 600 }}>
                    {new Date(nextAppointment.start_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              {nextAppointment.reason_category && (
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', background: 'var(--bg-glass)', padding: '0.6rem 0.85rem', borderRadius: 'var(--radius-sm)' }}>
                  <strong>Consultation Note:</strong> {nextAppointment.reason_category}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick Help & Architecture Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={20} color="var(--secondary-teal)" />
              <span>Platform Security Guarantees</span>
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              MediCloud adheres to strict healthcare data boundaries. All patient records in this demonstration are 100% synthetic and encrypted using modern cryptographic standards.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <CheckCircle2 size={16} color="var(--success)" />
                <span>Zero-knowledge client-side presigned S3 URLs</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <CheckCircle2 size={16} color="var(--success)" />
                <span>Argon2id cryptographic password hashing</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <CheckCircle2 size={16} color="var(--success)" />
                <span>Audited PostgreSQL schema with transactional locks</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-glass)' }}>
            <Link to="/documents" className="btn btn-outline" style={{ width: '100%', gap: '0.5rem' }}>
              <UploadCloud size={16} />
              <span>Manage Document Vault</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Medical Documents Table */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <FileText size={20} color="var(--primary-blue)" />
            <span>Recent Medical Documents</span>
          </h3>
          <Link to="/documents" style={{ fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span>Manage all documents</span>
            <ChevronRight size={16} />
          </Link>
        </div>

        {documents.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', padding: '1rem 0' }}>
            No medical documents uploaded yet. Upload a synthetic lab report to view SQS processing!
          </p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Document Name</th>
                  <th>Clinical Category</th>
                  <th>Uploaded Date</th>
                  <th>File Size</th>
                  <th>Processing Status</th>
                </tr>
              </thead>
              <tbody>
                {documents.slice(0, 4).map((doc) => (
                  <tr key={doc.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-sm)', background: 'var(--primary-subtle)', color: 'var(--primary-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <FileText size={16} />
                        </div>
                        <span style={{ fontWeight: 600 }}>{doc.original_filename}</span>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-neutral" style={{ textTransform: 'capitalize' }}>
                        {doc.document_type.toLowerCase().replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>
                      {new Date(doc.uploaded_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>
                      {(doc.file_size / 1024).toFixed(1)} KB
                    </td>
                    <td>
                      <span className={`badge ${doc.processing_status === 'COMPLETED' ? 'badge-success' : doc.processing_status === 'QUEUED' ? 'badge-warning' : 'badge-info'}`}>
                        {doc.processing_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
