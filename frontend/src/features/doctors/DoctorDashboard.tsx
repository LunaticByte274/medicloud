import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { Appointment } from '../../types/index.js';
import { apiRequest } from '../../lib/api.js';
import { Link } from 'react-router-dom';
import {
  CalendarCheck,
  Clock,
  User,
  CheckCircle2,
  Plus,
  Stethoscope,
  Activity,
} from 'lucide-react';

export const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      const data = await apiRequest<Appointment[]>('/appointments?limit=10');
      setAppointments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, []);

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await apiRequest(`/appointments/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      fetchSchedule();
    } catch (err: any) {
      alert(err.message || 'Status update failed');
    }
  };

  const pendingAppointments = appointments.filter((a) => a.status === 'BOOKED');
  const confirmedAppointments = appointments.filter((a) => a.status === 'CONFIRMED');

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '0.35rem' }}>Welcome, {user?.name}!</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Doctor Clinical Workspace — Review assigned patient appointments and manage consultation schedules.
          </p>
        </div>
        <Link to="/availability" className="btn btn-primary" style={{ gap: '0.5rem' }}>
          <Plus size={16} />
          <span>Add Availability</span>
        </Link>
      </div>

      {/* Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <div className="card">
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '0.5rem' }}>
            Pending Confirmations
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary-blue)' }}>
            {pendingAppointments.length}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Require clinical review</div>
        </div>

        <div className="card">
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '0.5rem' }}>
            Confirmed Consultations
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--success)' }}>
            {confirmedAppointments.length}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Scheduled with patients</div>
        </div>

        <div className="card">
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '0.5rem' }}>
            Total Consultations
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-main)' }}>
            {appointments.length}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Recorded in database</div>
        </div>
      </div>

      {/* Assigned Patient Appointments Table */}
      <div className="card">
        <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CalendarCheck size={18} color="var(--primary-blue)" />
          <span>Assigned Patient Consultations</span>
        </h3>

        {loading ? (
          <p style={{ color: 'var(--text-secondary)' }}>Loading consultations...</p>
        ) : appointments.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>No patient appointments assigned.</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Patient Name</th>
                  <th>Scheduled Time</th>
                  <th>Reason Category</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appt) => (
                  <tr key={appt.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{appt.patient_name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{appt.patient_phone || appt.patient_email}</div>
                    </td>
                    <td>
                      <div>{new Date(appt.start_at).toLocaleDateString()}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {new Date(appt.start_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td>{appt.reason_category}</td>
                    <td>
                      <span className={`badge ${appt.status === 'CONFIRMED' ? 'badge-success' : appt.status === 'BOOKED' ? 'badge-info' : 'badge-neutral'}`}>
                        {appt.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        {appt.status === 'BOOKED' && (
                          <button
                            onClick={() => handleStatusUpdate(appt.id, 'CONFIRMED')}
                            className="btn btn-secondary"
                            style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem' }}
                          >
                            <CheckCircle2 size={13} />
                            <span>Confirm</span>
                          </button>
                        )}
                        {appt.status === 'CONFIRMED' && (
                          <button
                            onClick={() => handleStatusUpdate(appt.id, 'COMPLETED')}
                            className="btn btn-primary"
                            style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem' }}
                          >
                            <CheckCircle2 size={13} />
                            <span>Mark Completed</span>
                          </button>
                        )}
                      </div>
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
