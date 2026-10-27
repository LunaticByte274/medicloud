import React, { useState, useEffect } from 'react';
import { Doctor, AvailabilitySlot } from '../../types/index.js';
import { apiRequest } from '../../lib/api.js';
import { useToast } from '../../context/ToastContext.js';
import { Calendar, Clock, DollarSign, AlertCircle, CheckCircle2, X } from 'lucide-react';

interface BookingModalProps {
  doctor: Doctor | null;
  onClose: () => void;
  onBooked: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({ doctor, onClose, onBooked }) => {
  if (!doctor) return null;
  const { showToast } = useToast();

  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<string>('');
  const [reasonCategory, setReasonCategory] = useState<string>('General Consultation');
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [bookingLoading, setBookingLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  useEffect(() => {
    const fetchSlots = async () => {
      try {
        setLoading(true);
        const data = await apiRequest<AvailabilitySlot[]>(`/availability/doctor/${doctor.id}?status=AVAILABLE`);
        setSlots(data);
        if (data.length > 0) {
          setSelectedSlotId(data[0].id);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load availability slots');
      } finally {
        setLoading(false);
      }
    };

    fetchSlots();
  }, [doctor.id]);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlotId) {
      setError('Please select an available appointment slot');
      return;
    }

    setBookingLoading(true);
    setError(null);

    try {
      await apiRequest('/appointments', {
        method: 'POST',
        body: JSON.stringify({
          doctorId: doctor.id,
          availabilityId: selectedSlotId,
          reasonCategory,
          notes,
        }),
      });

      setSuccess(true);
      showToast(`Appointment confirmed with ${doctor.name}!`, 'success');
      setTimeout(() => {
        onBooked();
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Booking failed');
      showToast(err.message || 'Booking failed', 'error');
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.35rem' }}>Book Consultation</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              with {doctor.name} ({doctor.specialization_name})
            </p>
          </div>
          <button onClick={onClose} className="btn btn-outline" style={{ padding: '0.4rem', borderRadius: 'var(--radius-full)' }}>
            <X size={18} />
          </button>
        </div>

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

        {success ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <CheckCircle2 size={48} color="var(--success)" style={{ marginBottom: '1rem' }} />
            <h4 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Appointment Confirmed!</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Your appointment has been securely stored in PostgreSQL and a notification was published.
            </p>
          </div>
        ) : (
          <form onSubmit={handleBooking} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Doctor info summary */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                backgroundColor: 'var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
              }}
            >
              <div>
                <strong>Qualification:</strong> {doctor.qualification}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', color: 'var(--primary-blue)', fontWeight: 600 }}>
                <DollarSign size={16} />
                <span>{Number(doctor.consultation_fee).toFixed(2)} Fee</span>
              </div>
            </div>

            {/* Availability Slots Picker */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                Select Available Slot *
              </label>

              {loading ? (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Loading live availability slots...</p>
              ) : slots.length === 0 ? (
                <div
                  style={{
                    padding: '1rem',
                    textAlign: 'center',
                    border: '1px dashed var(--border)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-secondary)',
                    fontSize: '0.85rem',
                  }}
                >
                  No available slots found for this doctor. Please check back later.
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.5rem', maxHeight: '180px', overflowY: 'auto' }}>
                  {slots.map((slot) => {
                    const isSelected = selectedSlotId === slot.id;
                    const start = new Date(slot.start_at);
                    const end = new Date(slot.end_at);

                    return (
                      <div
                        key={slot.id}
                        onClick={() => setSelectedSlotId(slot.id)}
                        style={{
                          padding: '0.65rem 0.85rem',
                          borderRadius: 'var(--radius-md)',
                          border: `1.5px solid ${isSelected ? 'var(--primary-blue)' : 'var(--border)'}`,
                          backgroundColor: isSelected ? 'var(--primary-subtle)' : 'var(--bg-card)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          transition: 'var(--transition)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                          <Calendar size={15} color="var(--primary-blue)" />
                          <span style={{ fontWeight: 600 }}>
                            {start.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                          </span>
                          <span style={{ color: 'var(--text-secondary)' }}>
                            {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                            {end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>
                          Available
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Reason Category */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                Consultation Reason *
              </label>
              <select
                className="input-field"
                value={reasonCategory}
                onChange={(e) => setReasonCategory(e.target.value)}
              >
                <option value="General Consultation">General Consultation</option>
                <option value="Cardiology Follow-up">Cardiology Follow-up</option>
                <option value="Pediatric Checkup">Pediatric Checkup</option>
                <option value="Diagnostic Review">Diagnostic / Lab Report Review</option>
                <option value="Medication Refill">Medication Refill & Prescription</option>
                <option value="Second Opinion">Second Opinion</option>
              </select>
            </div>

            {/* Optional Notes */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                Notes for Doctor (Optional)
              </label>
              <textarea
                className="input-field"
                rows={2}
                placeholder="Mention any symptoms, medications, or specific questions..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button type="button" onClick={onClose} className="btn btn-outline">
                Cancel
              </button>
              <button
                type="submit"
                disabled={bookingLoading || slots.length === 0}
                className="btn btn-primary"
              >
                {bookingLoading ? 'Securing Slot...' : 'Confirm Appointment'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
