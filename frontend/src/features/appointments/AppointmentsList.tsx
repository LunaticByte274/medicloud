import React, { useState, useEffect } from 'react';
import { Appointment } from '../../types/index.js';
import { useAuth } from '../../context/AuthContext.js';
import { apiRequest } from '../../lib/api.js';
import {
  Calendar,
  Clock,
  User,
  AlertCircle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Stethoscope,
  Filter,
} from 'lucide-react';

export const AppointmentsList: React.FC = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [error, setError] = useState<string | null>(null);

  // Cancellation modal state
  const [cancelModalAppt, setCancelModalAppt] = useState<Appointment | null>(null);
  const [cancellationReason, setCancellationReason] = useState<string>('');
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const data = await apiRequest<Appointment[]>(`/appointments?status=${activeTab}`);
      setAppointments(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [activeTab]);

  const handleCancelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelModalAppt) return;
    setActionLoading(true);
    try {
      await apiRequest(`/appointments/${cancelModalAppt.id}/cancel`, {
        method: 'POST',
        body: JSON.stringify({ cancellationReason }),
      });
      setCancelModalAppt(null);
      setCancellationReason('');
      fetchAppointments();
    } catch (err: any) {
      alert(err.message || 'Cancellation failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateStatus = async (apptId: string, status: string) => {
    try {
      await apiRequest(`/appointments/${apptId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      fetchAppointments();
    } catch (err: any) {
      alert(err.message || 'Status update failed');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <span className="badge badge-success">Confirmed</span>;
      case 'BOOKED':
        return <span className="badge badge-info">Booked</span>;
      case 'COMPLETED':
        return <span className="badge badge-neutral">Completed</span>;
      case 'CANCELLED':
        return <span className="badge badge-error">Cancelled</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '0.35rem' }}>
            {user?.role === 'DOCTOR' ? 'Patient Consultations' : user?.role === 'ADMIN' ? 'Platform Appointment Registry' : 'My Scheduled Consultations'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            View and manage real-time appointments backed by ACID transaction concurrency locks in RDS PostgreSQL.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '1.5rem',
          borderBottom: '1px solid var(--border)',
          paddingBottom: '0.5rem',
        }}
      >
        {['ALL', 'BOOKED', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '0.5rem 1rem',
              fontWeight: activeTab === tab ? 600 : 500,
              fontSize: '0.875rem',
              color: activeTab === tab ? 'var(--primary-blue)' : 'var(--text-secondary)',
              borderBottom: `2px solid ${activeTab === tab ? 'var(--primary-blue)' : 'transparent'}`,
              marginBottom: '-0.5rem',
              transition: 'var(--transition)',
            }}
          >
            {tab.charAt(0) + tab.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-secondary)' }}>
          <p>Loading appointments from PostgreSQL...</p>
        </div>
      ) : appointments.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 2rem', color: 'var(--text-secondary)' }}>
          <Calendar size={42} style={{ opacity: 0.3, marginBottom: '1rem' }} />
          <h3>No appointments found</h3>
          <p style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>
            {activeTab === 'ALL' ? 'No appointments recorded yet.' : `No appointments in ${activeTab.toLowerCase()} status.`}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {appointments.map((appt) => {
            const start = new Date(appt.start_at);
            const isUpcoming = ['BOOKED', 'CONFIRMED'].includes(appt.status);

            return (
              <div
                key={appt.id}
                className="card"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  <div
                    style={{
                      width: '54px',
                      height: '54px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--primary-subtle)',
                      color: 'var(--primary-blue)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                      {start.toLocaleDateString(undefined, { month: 'short' })}
                    </span>
                    <span style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                      {start.getDate()}
                    </span>
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
                      <h3 style={{ fontSize: '1.1rem' }}>
                        {user?.role === 'DOCTOR' ? appt.patient_name : appt.doctor_name}
                      </h3>
                      {getStatusBadge(appt.status)}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Clock size={14} />
                        <span>{start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div>•</div>
                      <div>{appt.specialization_name || 'Clinical Care'}</div>
                      <div>•</div>
                      <div style={{ fontStyle: 'italic' }}>{appt.reason_category}</div>
                    </div>

                    {appt.notes && (
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                        Notes: {appt.notes}
                      </p>
                    )}

                    {appt.cancellation_reason && (
                      <p style={{ fontSize: '0.8rem', color: 'var(--error)', marginTop: '0.35rem' }}>
                        Cancellation note: {appt.cancellation_reason}
                      </p>
                    )}
                  </div>
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {/* Doctor actions: Confirm or Complete */}
                  {user?.role === 'DOCTOR' && appt.status === 'BOOKED' && (
                    <button
                      onClick={() => handleUpdateStatus(appt.id, 'CONFIRMED')}
                      className="btn btn-secondary"
                      style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
                    >
                      <CheckCircle2 size={15} />
                      <span>Confirm</span>
                    </button>
                  )}

                  {user?.role === 'DOCTOR' && appt.status === 'CONFIRMED' && (
                    <button
                      onClick={() => handleUpdateStatus(appt.id, 'COMPLETED')}
                      className="btn btn-primary"
                      style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
                    >
                      <CheckCircle2 size={15} />
                      <span>Mark Completed</span>
                    </button>
                  )}

                  {/* Cancel button */}
                  {isUpcoming && (
                    <button
                      onClick={() => setCancelModalAppt(appt)}
                      className="btn btn-outline"
                      style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem', color: 'var(--error)' }}
                    >
                      <XCircle size={15} />
                      <span>Cancel</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancellation Modal */}
      {cancelModalAppt && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '440px' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Cancel Appointment</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
              Are you sure you want to cancel this appointment with {cancelModalAppt.doctor_name || cancelModalAppt.patient_name}? The doctor's slot will be released back to available.
            </p>

            <form onSubmit={handleCancelSubmit}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                Reason for cancellation *
              </label>
              <textarea
                required
                className="input-field"
                rows={3}
                placeholder="Please state the reason (e.g. Schedule conflict, symptoms resolved)..."
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                style={{ marginBottom: '1.25rem' }}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setCancelModalAppt(null)}
                  className="btn btn-outline"
                >
                  Keep Appointment
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="btn btn-danger"
                >
                  {actionLoading ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
