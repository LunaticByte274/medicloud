import React, { useState, useEffect } from 'react';
import { Doctor, Specialization } from '../../types/index.js';
import { apiRequest } from '../../lib/api.js';
import { BookingModal } from '../appointments/BookingModal.js';
import {
  Search,
  Filter,
  Stethoscope,
  Award,
  DollarSign,
  Calendar,
  Sparkles,
  HeartPulse,
} from 'lucide-react';

export const DoctorDiscovery: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [specializations, setSpecializations] = useState<Specialization[]>([]);
  const [selectedSpecId, setSelectedSpecId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  const fetchSpecializations = async () => {
    try {
      const data = await apiRequest<Specialization[]>('/specializations');
      setSpecializations(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      let url = '/doctors?limit=50';
      if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;
      if (selectedSpecId) url += `&specializationId=${encodeURIComponent(selectedSpecId)}`;

      const data = await apiRequest<Doctor[]>(url);
      setDoctors(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpecializations();
  }, []);

  useEffect(() => {
    const timer = setTimeout(fetchDoctors, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedSpecId]);

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.85rem', marginBottom: '0.35rem' }}>Find Healthcare Specialists</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Explore board-certified medical professionals, view availability schedules, and book verified appointments.
        </p>
      </div>

      {/* Search and Filters Bar */}
      <div
        className="card"
        style={{
          padding: '1.25rem',
          marginBottom: '2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            className="input-field"
            placeholder="Search doctors by name, qualifications, or biography..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '2.5rem', height: '44px' }}
          />
          <Search
            size={18}
            style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
          />
        </div>

        {/* Specialization Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setSelectedSpecId('')}
            className={`btn ${selectedSpecId === '' ? 'btn-primary' : 'btn-outline'}`}
            style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem', borderRadius: 'var(--radius-full)' }}
          >
            All Specialties
          </button>
          {specializations.map((spec) => (
            <button
              key={spec.id}
              onClick={() => setSelectedSpecId(spec.id)}
              className={`btn ${selectedSpecId === spec.id ? 'btn-primary' : 'btn-outline'}`}
              style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem', borderRadius: 'var(--radius-full)' }}
            >
              {spec.name} {spec.doctor_count !== undefined && `(${spec.doctor_count})`}
            </button>
          ))}
        </div>
      </div>

      {/* Doctors Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-secondary)' }}>
          <HeartPulse size={36} color="var(--primary-blue)" style={{ animation: 'spin 1.5s linear infinite', marginBottom: '1rem' }} />
          <p>Loading available healthcare providers...</p>
        </div>
      ) : doctors.length === 0 ? (
        <div
          className="card"
          style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            color: 'var(--text-secondary)',
          }}
        >
          <Stethoscope size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
          <h3>No doctors found</h3>
          <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
            Try broadening your search terms or clearing the specialization filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedSpecId('');
            }}
            className="btn btn-outline"
            style={{ marginTop: '1.25rem' }}
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.5rem' }}>
          {doctors.map((doc) => (
            <div
              key={doc.id}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '1.25rem',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: 'var(--primary-subtle)',
                        color: 'var(--primary-blue)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '1.1rem',
                      }}
                    >
                      {doc.name.replace('Dr. ', '').charAt(0)}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.15rem' }}>{doc.name}</h3>
                      <span className="badge badge-info" style={{ marginTop: '0.2rem' }}>
                        {doc.specialization_name}
                      </span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary-blue)' }}>
                      ${Number(doc.consultation_fee).toFixed(0)}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>per visit</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Award size={15} />
                    <span>{doc.qualification}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Sparkles size={15} />
                    <span>{doc.experience_years} yrs exp</span>
                  </div>
                </div>

                <p
                  style={{
                    fontSize: '0.85rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.5,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {doc.biography || 'Dedicated physician committed to patient-centered clinical care and evidence-based treatments.'}
                </p>
              </div>

              <div style={{ paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
                <button
                  onClick={() => setSelectedDoctor(doc)}
                  className="btn btn-primary"
                  style={{ width: '100%', gap: '0.5rem' }}
                >
                  <Calendar size={16} />
                  <span>Book Consultation</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Booking Modal */}
      {selectedDoctor && (
        <BookingModal
          doctor={selectedDoctor}
          onClose={() => setSelectedDoctor(null)}
          onBooked={() => {
            fetchDoctors();
          }}
        />
      )}
    </div>
  );
};
