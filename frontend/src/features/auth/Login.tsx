import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { useNavigate, Link } from 'react-router-dom';
import {
  HeartPulse,
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  UserCheck,
  Stethoscope,
  Activity,
  ArrowRight,
  Cloud,
} from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Password123!');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1.5rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative Ambient Background Orbs */}
      <div
        style={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37, 99, 235, 0.18) 0%, transparent 70%)',
          top: '-150px',
          left: '-150px',
          pointerEvents: 'none',
          filter: 'blur(40px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(15, 118, 110, 0.16) 0%, transparent 70%)',
          bottom: '-150px',
          right: '-150px',
          pointerEvents: 'none',
          filter: 'blur(40px)',
        }}
      />

      <div
        className="card card-featured"
        style={{
          width: '100%',
          maxWidth: '480px',
          padding: '2.5rem',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 1,
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, var(--primary-blue), var(--secondary-teal))',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              marginBottom: '1rem',
              boxShadow: '0 8px 20px var(--primary-glow)',
            }}
          >
            <HeartPulse size={30} />
          </div>
          <h2 style={{ fontSize: '1.85rem', marginBottom: '0.35rem' }}>
            Welcome to <span className="gradient-text">MediCloud</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
            Cloud-Native Clinical Scheduling & Asynchronous Document Intelligence
          </p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.75rem' }}>
            <span className="cloud-beacon" style={{ fontSize: '0.7rem', padding: '0.25rem 0.65rem' }}>
              <span className="beacon-dot" />
              <span>AWS CloudFormation Deployed</span>
            </span>
          </div>
        </div>

        {error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--error-bg)',
              border: '1px solid var(--error-border)',
              color: 'var(--error)',
              fontSize: '0.85rem',
              marginBottom: '1.5rem',
              animation: 'slideUp 0.2s ease-out',
            }}
          >
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                required
                className="input-field"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
              />
              <Mail
                size={18}
                style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
              />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                Password
              </label>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                className="input-field"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
              />
              <Lock
                size={18}
                style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '0.85rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.85rem', fontSize: '0.95rem', marginTop: '0.5rem' }}
          >
            {loading ? 'Authenticating...' : 'Sign In to Workspace'}
          </button>
        </form>

        {/* Demo Fast-Switch Cards for Evaluators and Viva Defense */}
        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-glass)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.85rem' }}>
            <Sparkles size={16} color="var(--primary-blue)" />
            <span>Instant Demo Personas (Click to autofill):</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {/* Patient Demo */}
            <div
              onClick={() => handleQuickDemo('sarah.jenkins@example.com')}
              className="card-interactive"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 0.95rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--border-subtle)',
                border: '1px solid var(--border)',
                transition: 'var(--transition-fast)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '30px', height: '30px', borderRadius: 'var(--radius-full)', background: 'var(--primary-subtle)', color: 'var(--primary-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <UserCheck size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>Sarah Jenkins</div>
                  <div style={{ fontSize: '0.725rem', color: 'var(--text-secondary)' }}>Patient • Booking & S3 Uploads</div>
                </div>
              </div>
              <span className="badge badge-success" style={{ fontSize: '0.675rem' }}>Patient</span>
            </div>

            {/* Doctor Demo */}
            <div
              onClick={() => handleQuickDemo('dr.marcus.vance@example.com')}
              className="card-interactive"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 0.95rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--border-subtle)',
                border: '1px solid var(--border)',
                transition: 'var(--transition-fast)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '30px', height: '30px', borderRadius: 'var(--radius-full)', background: 'var(--teal-subtle)', color: 'var(--secondary-teal)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Stethoscope size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>Dr. Marcus Vance</div>
                  <div style={{ fontSize: '0.725rem', color: 'var(--text-secondary)' }}>Cardiology • Manage Schedule</div>
                </div>
              </div>
              <span className="badge badge-info" style={{ fontSize: '0.675rem' }}>Doctor</span>
            </div>

            {/* Admin Demo */}
            <div
              onClick={() => handleQuickDemo('admin.elena@example.com')}
              className="card-interactive"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 0.95rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--border-subtle)',
                border: '1px solid var(--border)',
                transition: 'var(--transition-fast)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '30px', height: '30px', borderRadius: 'var(--radius-full)', background: 'var(--error-bg)', color: 'var(--error)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Activity size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>Elena Rostova</div>
                  <div style={{ fontSize: '0.725rem', color: 'var(--text-secondary)' }}>Admin • Metrics & SQS Queue</div>
                </div>
              </div>
              <span className="badge badge-error" style={{ fontSize: '0.675rem' }}>Admin</span>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ fontWeight: 700, color: 'var(--primary-blue)' }}>
            Register as a Patient →
          </Link>
        </div>
      </div>
    </div>
  );
};
