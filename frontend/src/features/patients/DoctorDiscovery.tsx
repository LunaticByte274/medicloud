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
  Clock,
  Star,
  MapPin,
  ChevronRight,
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
        <h1 style={{ fontSize: '2rem', marginBottom: '0.4rem' }}>Find Healthcare Specialists</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Explore board-certified medical professionals, view availability schedules, and book verified clinical appointments.
        </p>
      </div>

      {/* Search and Filters Bar */}
      <div
        className="card card-featured"
        style={{
          padding: '1.5rem',
          marginBottom: '2.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
        }}
      >
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            className="input-field"
            placeholder="Search doctors by name, clinical qualifications, or specialty..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '2.75rem', height: '48px', fontSize: '0.95rem' }}
          />
          <Search
            size={20}
            style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
          />
        </div>

        {/* Specialization Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setSelectedSpecId('')}
            className={`btn ${selectedSpecId === '' ? 'btn-primary' : 'btn-outline'}`}
            style={{ padding: '0.45rem 1rem', fontSize: '0.8rem', borderRadius: 'var(--radius-full)' }}
          >
            All Specialties
          </button>
          {specializations.map((spec) => (
            <button
              key={spec.id}
              onClick={() => setSelectedSpecId(spec.id)}
              className={`btn ${selectedSpecId === spec.id ? 'btn-primary' : 'btn-outline'}`}
              style={{ padding: '0.45rem 1rem', fontSize: '0.8rem', borderRadius: 'var(--radius-full)' }}
            >
              {spec.name} {spec.doctor_count !== undefined && `(${spec.doctor_count})`}
            </button>
          ))}
        </div>
      </div>

      {/* Doctors Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-secondary)' }}>
          <HeartPulse size={42} color="var(--primary-blue)" style={{ animation: 'spin 2s linear infinite', marginBottom: '1rem' }} />
          <p style={{ fontWeight: 600 }}>Filtering verified physicians...</p>
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
          <Stethoscope size={52} style={{ opacity: 0.25, marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.25rem' }}>No healthcare providers matched your search</h3>
          <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Try broadening your search terms or clearing the clinical specialty filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedSpecId('');
            }}
            className="btn btn-outline"
            style={{ marginTop: '1.5rem', padding: '0.6rem 1.5rem' }}
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.5rem' }}>
          {doctors.map((doc) => (
            <div
              key={doc.id}
              className="card card-interactive"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '1.25rem',
                padding: '1.75rem',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div
                      style={{
                        width: '52px',
                        height: '52px',
                        borderRadius: 'var(--radius-xl)',
                        background: 'linear-gradient(135deg, var(--primary-blue), var(--secondary-teal))',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '1.25rem',
                        boxShadow: '0 4px 14px var(--primary-glow)',
                      }}
                    >
                      {doc.name.replace('Dr. ', '').charAt(0)}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.2rem', marginBottom: '0.2rem' }}>{doc.name}</h3>
                      <span className="badge badge-info" style={{ fontSize: '0.725rem' }}>
                        {doc.specialization_name}
                      </span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', background: 'var(--border-subtle)', padding: '0.4rem 0.75rem', borderRadius: 'var(--radius-md)' }}>
                    <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary-blue)' }}>
                      ${Number(doc.consultation_fee).toFixed(0)}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>per visit</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '0.85rem', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Award size={15} color="var(--primary-blue)" />
                    <span style={{ fontWeight: 600 }}>{doc.qualification}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Sparkles size={15} color="#FBBF24" />
                    <span>{doc.experience_years} yrs clinical experience</span>
                  </div>
                </div>

                <p
                  style={{
                    fontSize: '0.875rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.55,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {doc.biography || 'Dedicated physician committed to patient-centered clinical care and evidence-based treatments.'}
                </p>
              </div>

              <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
                <button
                  onClick={() => setSelectedDoctor(doc)}
                  className="btn btn-primary"
                  style={{ width: '100%', gap: '0.5rem', padding: '0.75rem' }}
                >
                  <Calendar size={16} />
                  <span>Schedule Consultation</span>
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
