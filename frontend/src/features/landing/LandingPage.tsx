import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { useTheme } from '../../context/ThemeContext.js';
import {
  HeartPulse,
  Cloud,
  Lock,
  Activity,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
  CalendarCheck,
  FileText,
  UserCheck,
  Stethoscope,
  Sparkles,
  ExternalLink,
  Sun,
  Moon,
  CheckCircle2,
  Database,
  Cpu,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { user, login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleQuickLogin = async (email: string) => {
    try {
      await login(email, 'Password123!');
      navigate('/dashboard');
    } catch (err) {
      navigate('/login');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Header */}
      <header
        style={{
          height: '74px',
          borderBottom: '1px solid var(--border-glass)',
          backgroundColor: 'var(--header-bg)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 2rem',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, var(--primary-blue), var(--secondary-teal))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: '0 4px 14px var(--primary-glow)',
            }}
          >
            <HeartPulse size={24} />
          </div>
          <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.03em' }}>
            Medi<span className="gradient-text">Cloud</span>
          </span>
        </div>

        {/* Center Nav Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '1.75rem' }} className="hide-mobile">
          <a href="#features" style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Features</a>
          <Link to="/architecture" style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Cloud Architecture</Link>
          <a href="#viva" style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Academic Rubric</a>
        </nav>

        {/* Right CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <button
            onClick={toggleTheme}
            className="btn btn-outline"
            style={{ padding: '0.5rem', borderRadius: 'var(--radius-full)' }}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun size={18} color="#FBBF24" /> : <Moon size={18} />}
          </button>

          {user ? (
            <Link to="/dashboard" className="btn btn-primary" style={{ padding: '0.6rem 1.25rem' }}>
              <span>Enter Workspace</span>
              <ArrowRight size={16} />
            </Link>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link to="/login" className="btn btn-outline" style={{ padding: '0.6rem 1.15rem' }}>
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary" style={{ padding: '0.6rem 1.25rem' }}>
                Get Started
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section
        style={{
          padding: '5rem 2rem 4rem',
          maxWidth: '1240px',
          margin: '0 auto',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <span className="cloud-beacon" style={{ padding: '0.45rem 1rem', fontSize: '0.825rem' }}>
            <span className="beacon-dot" />
            <span>AWS CloudFormation Active: us-east-1 (531988093771)</span>
          </span>
        </div>

        <h1
          style={{
            fontSize: 'clamp(2.5rem, 5.5vw, 4.25rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.035em',
            marginBottom: '1.5rem',
            maxWidth: '1000px',
            margin: '0 auto 1.5rem',
          }}
        >
          Cloud-Native Healthcare Platform &{' '}
          <span className="gradient-text">Asynchronous Document Intelligence</span>
        </h1>

        <p
          style={{
            fontSize: 'clamp(1rem, 2vw, 1.25rem)',
            color: 'var(--text-secondary)',
            maxWidth: '780px',
            margin: '0 auto 2.5rem',
            lineHeight: 1.6,
          }}
        >
          Engineered as a decoupled AWS cloud platform. Features zero-knowledge client-side S3 presigned uploads, decoupled SQS OCR extraction, and ACID-compliant concurrency locking on Amazon RDS PostgreSQL.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '3.5rem' }}>
          <Link
            to={user ? '/dashboard' : '/login'}
            className="btn btn-primary"
            style={{ padding: '0.85rem 2rem', fontSize: '1rem', gap: '0.6rem', boxShadow: '0 8px 24px var(--primary-glow)' }}
          >
            <span>Launch Live Platform</span>
            <ArrowRight size={18} />
          </Link>
          <Link
            to="/architecture"
            className="btn btn-outline"
            style={{ padding: '0.85rem 1.8rem', fontSize: '1rem', gap: '0.6rem' }}
          >
            <Layers size={18} color="var(--primary-blue)" />
            <span>Inspect AWS Topology Blueprint</span>
          </Link>
        </div>

        {/* Evaluator 1-Click Instant Persona Bar */}
        <div
          className="card card-featured"
          style={{
            maxWidth: '920px',
            margin: '0 auto',
            padding: '1.75rem',
            textAlign: 'left',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.95rem' }}>
              <Sparkles size={18} color="var(--primary-blue)" />
              <span>Viva Voce Evaluator Fast-Switch (1-Click Instant Login):</span>
            </div>
            <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>Zero-Password Demo Access</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
            {/* Sarah Jenkins - Patient */}
            <div
              onClick={() => handleQuickLogin('sarah.jenkins@example.com')}
              className="card-interactive"
              style={{
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--border-subtle)',
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
              }}
            >
              <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-full)', background: 'var(--primary-subtle)', color: 'var(--primary-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                SJ
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Sarah Jenkins</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Patient • Booking & S3 Uploads</div>
              </div>
            </div>

            {/* Dr. Marcus Vance - Doctor */}
            <div
              onClick={() => handleQuickLogin('dr.marcus.vance@example.com')}
              className="card-interactive"
              style={{
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--border-subtle)',
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
              }}
            >
              <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-full)', background: 'var(--teal-subtle)', color: 'var(--secondary-teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                MV
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Dr. Marcus Vance</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Doctor • Cardiology Workspace</div>
              </div>
            </div>

            {/* Elena Rostova - Admin */}
            <div
              onClick={() => handleQuickLogin('admin.elena@example.com')}
              className="card-interactive"
              style={{
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--border-subtle)',
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
              }}
            >
              <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-full)', background: 'var(--error-bg)', color: 'var(--error)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                ER
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Elena Rostova</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Admin • SQS & System Telemetry</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Architectural Pillars / Features Section */}
      <section
        id="features"
        style={{
          padding: '4rem 2rem 5rem',
          maxWidth: '1240px',
          margin: '0 auto',
          width: '100%',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <h2 style={{ fontSize: '2.25rem', marginBottom: '0.5rem' }}>Enterprise Cloud Architecture Pillars</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
            Built strictly in compliance with computer engineering cloud rubrics: non-serverless dedicated compute, private storage, and isolated networks.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.75rem' }}>
          {/* S3 Presigned Uploads */}
          <div className="card card-featured">
            <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'var(--primary-subtle)', color: 'var(--primary-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <Lock size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Zero-Knowledge S3 Vault</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1rem' }}>
              Files are uploaded directly from the browser to Amazon S3 via short-lived SigV4 presigned URLs. The bucket enforces Block Public Access and AES256 encryption at rest.
            </p>
            <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>S3 Presigned • AES256</span>
          </div>

          {/* Decoupled SQS Worker */}
          <div className="card card-featured">
            <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'var(--teal-subtle)', color: 'var(--secondary-teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <Activity size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Asynchronous SQS Queue & DLQ</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1rem' }}>
              Decoupled background worker polls SQS with 20-second long polling. Poison messages that fail 3 times are routed to an isolated Dead-Letter Queue (DLQ).
            </p>
            <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>SQS • DLQ Redrive</span>
          </div>

          {/* Concurrency Row Locks */}
          <div className="card card-featured">
            <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'var(--error-bg)', color: 'var(--error)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <Database size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>ACID Concurrency Locks</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1rem' }}>
              Prevents double-booking via PostgreSQL row-level pessimistic locking (<code>SELECT ... FOR UPDATE</code>) across isolated private database subnets.
            </p>
            <span className="badge badge-error" style={{ fontSize: '0.7rem' }}>PostgreSQL 16 • ACID</span>
          </div>

          {/* Custom Multi-Tier VPC */}
          <div className="card card-featured">
            <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'var(--primary-subtle)', color: 'var(--primary-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <Cloud size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Custom Multi-Tier VPC</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1rem' }}>
              Dedicated CIDR 10.0.0.0/16 VPC spanning 2 Availability Zones. Database tier has zero public route table exposure for defense-in-depth isolation.
            </p>
            <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>10.0.0.0/16 • 2 AZs</span>
          </div>

          {/* SNS Clinical Event Bus */}
          <div className="card card-featured">
            <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'var(--teal-subtle)', color: 'var(--secondary-teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <Zap size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Amazon SNS Event Dispatch</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1rem' }}>
              Publishes appointment events and operational notifications to subscribed administrators and patients via Amazon Simple Notification Service.
            </p>
            <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>Amazon SNS • Pub/Sub</span>
          </div>

          {/* Cost Governance & Free Tier */}
          <div className="card card-featured">
            <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'var(--info-bg)', color: 'var(--info)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <ShieldCheck size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>$15 Budget Cap & CloudWatch</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1rem' }}>
              Enforces a strict $15 monthly AWS spending cap with 85% forecast alerts, alongside CloudWatch alarms on unprocessed SQS queue backlog depth.
            </p>
            <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>AWS Budgets • CloudWatch</span>
          </div>
        </div>
      </section>

      {/* Academic Viva Voce Callout Section */}
      <section
        id="viva"
        style={{
          padding: '4rem 2rem',
          backgroundColor: 'var(--border-subtle)',
          borderTop: '1px solid var(--border-glass)',
          borderBottom: '1px solid var(--border-glass)',
        }}
      >
        <div style={{ maxWidth: '1040px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary-blue)', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.5rem' }}>
              <ShieldCheck size={18} />
              <span>COLLEGE DEMONSTRATION & VIVA VOCE DEFENSE READY</span>
            </div>
            <h2 style={{ fontSize: '1.85rem', marginBottom: '0.5rem' }}>Comprehensive Academic Project Deliverables</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '640px', lineHeight: 1.6 }}>
              Complete 34-section technical report, step-by-step 10-minute live demo script, and complete viva question defense handbook included in the repository.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link to="/architecture" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', gap: '0.5rem' }}>
              <Layers size={17} />
              <span>View Architecture Blueprint</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          padding: '2.5rem 2rem',
          maxWidth: '1240px',
          margin: '0 auto',
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          fontSize: '0.85rem',
          color: 'var(--text-muted)',
        }}
      >
        <div>
          <strong style={{ color: 'var(--text-main)' }}>MediCloud Platform</strong> • Third-Year Computer Engineering Cloud Computing Mini Project
        </div>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <span>AWS Account: <strong>531988093771</strong></span>
          <span>Region: <strong>us-east-1</strong></span>
          <span>100% Synthetic Data</span>
        </div>
      </footer>
    </div>
  );
};
