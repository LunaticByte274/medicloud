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
      {/* Welcome Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, var(--primary-blue), var(--secondary-teal))',
          color: '#FFFFFF',
          padding: '2.25rem',
          marginBottom: '2rem',
          border: 'none',
        }}
      >
        <h1 style={{ fontSize: '1.9rem', color: '#FFFFFF', marginBottom: '0.4rem' }}>
          Welcome back, {user?.name}! 👋
        </h1>
        <p style={{ opacity: 0.9, fontSize: '0.95rem', maxWidth: '640px', lineHeight: 1.6 }}>
          MediCloud provides cloud-backed healthcare services. Schedule consultations, upload synthetic medical reports, and track background Textract OCR processing.
        </p>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
          <Link
            to="/doctors"
            className="btn"
            style={{ backgroundColor: '#FFFFFF', color: 'var(--primary-blue)', fontWeight: 700 }}
          >
            <Search size={16} />
            <span>Find a Doctor</span>
          </Link>
          <Link
            to="/documents"
            className="btn btn-outline"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', color: '#FFFFFF', borderColor: 'rgba(255, 255, 255, 0.3)' }}
          >
            <UploadCloud size={16} />
            <span>Upload Document</span>
          </Link>
        </div>
      </div>

      {/* Grid: Upcoming Appointment & Quick Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1.5rem', marginBottom: '2.5rem' }}>
        {/* Next Scheduled Appointment */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={18} color="var(--primary-blue)" />
              <span>Next Upcoming Consultation</span>
            </h3>
            <Link to="/appointments" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
              View all →
            </Link>
          </div>

          {loading ? (
            <p style={{ color: 'var(--text-secondary)' }}>Loading schedule...</p>
          ) : !nextAppointment ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-secondary)' }}>
              <Clock size={36} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
              <p>You have no pending consultations scheduled.</p>
              <Link to="/doctors" className="btn btn-primary" style={{ marginTop: '1rem', padding: '0.45rem 1rem' }}>
                Book Now
              </Link>
            </div>
          ) : (
            <div
              style={{
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--border-subtle)',
                borderLeft: '4px solid var(--primary-blue)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div>
                  <h4 style={{ fontSize: '1.15rem', marginBottom: '0.2rem' }}>{nextAppointment.doctor_name}</h4>
                  <span className="badge badge-info">{nextAppointment.specialization_name}</span>
                </div>
                <span className="badge badge-success">Confirmed</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Calendar size={15} />
                  <span>{new Date(nextAppointment.start_at).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Clock size={15} />
                  <span>{new Date(nextAppointment.start_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>

              {nextAppointment.reason_category && (
                <p style={{ fontSize: '0.825rem', color: 'var(--text-main)', fontStyle: 'italic' }}>
                  Reason: {nextAppointment.reason_category}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Health Hub Metrics */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="card" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--primary-subtle)',
                color: 'var(--primary-blue)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FileText size={22} />
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{documents.length}</div>
              <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>Medical Documents Uploaded</div>
            </div>
          </div>

          <div className="card" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--teal-subtle)',
                color: 'var(--secondary-teal)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <HeartPulse size={22} />
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>Encrypted S3</div>
              <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>Zero-Knowledge Private Storage</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Medical Documents Table */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={18} color="var(--primary-blue)" />
            <span>Recent Medical Documents</span>
          </h3>
          <Link to="/documents" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
            Manage all files →
          </Link>
        </div>

        {documents.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>No medical documents uploaded yet.</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Filename</th>
                  <th>Category</th>
                  <th>Uploaded Date</th>
                  <th>Processing Status</th>
                </tr>
              </thead>
              <tbody>
                {documents.slice(0, 4).map((doc) => (
                  <tr key={doc.id}>
                    <td style={{ fontWeight: 600 }}>{doc.original_filename}</td>
                    <td style={{ textTransform: 'capitalize' }}>{doc.document_type.toLowerCase().replace('_', ' ')}</td>
                    <td>{new Date(doc.uploaded_at).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge ${doc.processing_status === 'COMPLETED' ? 'badge-success' : 'badge-info'}`}>
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
