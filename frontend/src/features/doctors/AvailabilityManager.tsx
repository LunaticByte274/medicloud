import React, { useState, useEffect } from 'react';
import { AvailabilitySlot } from '../../types/index.js';
import { useAuth } from '../../context/AuthContext.js';
import { apiRequest } from '../../lib/api.js';
import {
  Clock,
  Calendar,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export const AvailabilityManager: React.FC = () => {
  const { user } = useAuth();
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [formLoading, setFormLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Slot creation form
  const [slotDate, setSlotDate] = useState<string>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [startTime, setStartTime] = useState<string>('09:00');
  const [endTime, setEndTime] = useState<string>('09:45');

  const fetchSlots = async () => {
    if (!user?.doctorId) return;
    try {
      setLoading(true);
      const data = await apiRequest<AvailabilitySlot[]>(`/availability/doctor/${user.doctorId}?status=ALL`);
      setSlots(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load availability slots');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, [user]);

  const handleCreateSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const startAt = new Date(`${slotDate}T${startTime}:00`).toISOString();
    const endAt = new Date(`${slotDate}T${endTime}:00`).toISOString();

    if (new Date(endAt) <= new Date(startAt)) {
      setError('End time must be after start time');
      return;
    }

    if (new Date(startAt) <= new Date()) {
      setError('Availability slots must be set in the future');
      return;
    }

    setFormLoading(true);
    try {
      await apiRequest('/availability', {
        method: 'POST',
        body: JSON.stringify({
          startAt,
          endAt,
        }),
      });

      setSuccess('Availability slot created successfully');
      fetchSlots();
    } catch (err: any) {
      setError(err.message || 'Failed to create slot');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    if (!confirm('Are you sure you want to remove this availability slot?')) return;
    try {
      await apiRequest(`/availability/${slotId}`, { method: 'DELETE' });
      fetchSlots();
    } catch (err: any) {
      alert(err.message || 'Failed to delete slot');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.85rem', marginBottom: '0.35rem' }}>Manage Consultation Availability</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Define open consultation windows for patients. Overlapping slots are automatically prevented by database constraints.
        </p>
      </div>

      {/* Slot Creator Form */}
      <div className="card" style={{ marginBottom: '2rem', padding: '1.75rem' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={20} color="var(--primary-blue)" />
          <span>Add Availability Window</span>
        </h3>

        {error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--error-bg)',
              color: 'var(--error)',
              fontSize: '0.85rem',
              marginBottom: '1rem',
            }}
          >
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--success-bg)',
              color: 'var(--success)',
              fontSize: '0.85rem',
              marginBottom: '1rem',
            }}
          >
            <CheckCircle2 size={18} />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleCreateSlot} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
              Date
            </label>
            <input
              type="date"
              required
              className="input-field"
              value={slotDate}
              onChange={(e) => setSlotDate(e.target.value)}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
              Start Time
            </label>
            <input
              type="time"
              required
              className="input-field"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
              End Time
            </label>
            <input
              type="time"
              required
              className="input-field"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={formLoading}
              className="btn btn-primary"
              style={{ width: '100%', height: '42px' }}
            >
              {formLoading ? 'Creating Slot...' : 'Create Slot'}
            </button>
          </div>
        </form>
      </div>

      {/* Slots List Table */}
      <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Active & Upcoming Slots</h3>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-secondary)' }}>
          <p>Loading schedule slots...</p>
        </div>
      ) : slots.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem', color: 'var(--text-secondary)' }}>
          <Clock size={40} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
          <h3>No slots defined</h3>
          <p style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Add availability windows above so patients can schedule appointments with you.
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Time Window</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {slots.map((slot) => {
                const start = new Date(slot.start_at);
                const end = new Date(slot.end_at);
                const isBooked = slot.availability_status === 'BOOKED';

                return (
                  <tr key={slot.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                        <Calendar size={16} color="var(--primary-blue)" />
                        <span>{start.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Clock size={15} color="var(--text-muted)" />
                        <span>{start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <span>-</span>
                        <span>{end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${isBooked ? 'badge-warning' : 'badge-success'}`}>
                        {slot.availability_status}
                      </span>
                    </td>
                    <td>
                      {isBooked ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                          <Lock size={14} />
                          <span>Booked (Locked)</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleDeleteSlot(slot.id)}
                          className="btn btn-outline"
                          style={{ padding: '0.35rem 0.65rem', color: 'var(--error)', fontSize: '0.75rem' }}
                          title="Delete Unbooked Slot"
                        >
                          <Trash2 size={14} />
                          <span>Remove</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
