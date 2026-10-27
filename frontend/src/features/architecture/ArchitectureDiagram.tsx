import React, { useState } from 'react';
import {
  Globe,
  Shield,
  Server,
  Database,
  Lock,
  Layers,
  Activity,
  Bell,
  ArrowRight,
  ArrowDown,
  ArrowUp,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Mail,
  Zap,
  Cloud,
} from 'lucide-react';

interface ArchitectureDiagramProps {
  onSelectNode: (nodeId: string) => void;
  selectedNodeId: string;
}

export type ActiveFlow = 'ALL' | 'BOOKING' | 'S3_UPLOAD' | 'SQS_WORKER' | 'NOTIFICATIONS';

export const ArchitectureDiagram: React.FC<ArchitectureDiagramProps> = ({
  onSelectNode,
  selectedNodeId,
}) => {
  const [activeFlow, setActiveFlow] = useState<ActiveFlow>('ALL');

  return (
    <div className="card card-featured" style={{ marginBottom: '2.5rem', padding: '1.75rem' }}>
      {/* Diagram Header & Flow Selector Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Layers size={22} color="var(--primary-blue)" />
            <span>Multi-Tier AWS Cloud Topology & Data Flow Diagram</span>
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Interactive architectural blueprint showing custom VPC network boundaries, isolated subnets, and decoupled AWS service flows.
          </p>
        </div>

        {/* Flow Selector Pills */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveFlow('ALL')}
            className={`btn ${activeFlow === 'ALL' ? 'btn-primary' : 'btn-outline'}`}
            style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem', borderRadius: 'var(--radius-full)' }}
          >
            All Flows
          </button>
          <button
            onClick={() => setActiveFlow('BOOKING')}
            className={`btn ${activeFlow === 'BOOKING' ? 'btn-primary' : 'btn-outline'}`}
            style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem', borderRadius: 'var(--radius-full)' }}
          >
            1. Booking & Row Lock
          </button>
          <button
            onClick={() => setActiveFlow('S3_UPLOAD')}
            className={`btn ${activeFlow === 'S3_UPLOAD' ? 'btn-primary' : 'btn-outline'}`}
            style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem', borderRadius: 'var(--radius-full)' }}
          >
            2. Direct S3 Upload
          </button>
          <button
            onClick={() => setActiveFlow('SQS_WORKER')}
            className={`btn ${activeFlow === 'SQS_WORKER' ? 'btn-primary' : 'btn-outline'}`}
            style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem', borderRadius: 'var(--radius-full)' }}
          >
            3. SQS Queue & DLQ
          </button>
          <button
            onClick={() => setActiveFlow('NOTIFICATIONS')}
            className={`btn ${activeFlow === 'NOTIFICATIONS' ? 'btn-primary' : 'btn-outline'}`}
            style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem', borderRadius: 'var(--radius-full)' }}
          >
            4. SNS Notifications
          </button>
        </div>
      </div>

      {/* Main Visual Canvas Container */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '260px 1fr 300px',
          gap: '1.25rem',
          backgroundColor: 'var(--bg-main)',
          padding: '1.5rem',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          overflowX: 'auto',
          minWidth: '880px',
        }}
      >
        {/* ==================================================================== */}
        {/* COLUMN 1: CLIENT & PUBLIC INTERNET ZONE */}
        {/* ==================================================================== */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Globe size={14} />
            <span>Public Internet Zone</span>
          </div>

          {/* Web Browser Client Card */}
          <div
            className="card"
            style={{
              padding: '1.25rem',
              border: '1.5px solid var(--border)',
              backgroundColor: 'var(--bg-card)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-sm)', background: 'var(--primary-subtle)', color: 'var(--primary-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Globe size={18} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.95rem' }}>Web Browser (SPA)</h4>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>React 18 + Vite Frontend</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.725rem', color: 'var(--text-secondary)', marginTop: '0.75rem', paddingTop: '0.6rem', borderTop: '1px solid var(--border-subtle)' }}>
              <div>👤 Patients (Book appointments)</div>
              <div>🩺 Doctors (Manage schedule)</div>
              <div>🛡️ Administrators (Cloud metrics)</div>
            </div>
          </div>

          {/* Active Flow Legend & Direction Indicator */}
          <div
            style={{
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--border-subtle)',
              border: '1px solid var(--border)',
              fontSize: '0.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
            }}
          >
            <div style={{ fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Zap size={14} color="var(--primary-blue)" />
              <span>Flow Legend:</span>
            </div>
            {(activeFlow === 'ALL' || activeFlow === 'BOOKING') && (
              <div style={{ color: 'var(--primary-blue)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary-blue)' }} />
                <span>REST API: Port 5001 (ALB Ingress)</span>
              </div>
            )}
            {(activeFlow === 'ALL' || activeFlow === 'S3_UPLOAD') && (
              <div style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)' }} />
                <span>Direct S3 Upload: HTTPS SigV4</span>
              </div>
            )}
            {(activeFlow === 'ALL' || activeFlow === 'SQS_WORKER') && (
              <div style={{ color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--warning)' }} />
                <span>Asynchronous Queue: Long-Polling</span>
              </div>
            )}
            {(activeFlow === 'ALL' || activeFlow === 'NOTIFICATIONS') && (
              <div style={{ color: '#A855F7', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#A855F7' }} />
                <span>SNS Event Bus & CloudWatch Alarms</span>
              </div>
            )}
          </div>
        </div>

        {/* ==================================================================== */}
        {/* COLUMN 2: CUSTOM AMAZON VPC BOUNDARY (10.0.0.0/16) */}
        {/* ==================================================================== */}
        <div
          onClick={() => onSelectNode('vpc')}
          style={{
            border: selectedNodeId === 'vpc' ? '2px solid var(--primary-blue)' : '2px dashed rgba(37, 99, 235, 0.4)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem',
            backgroundColor: selectedNodeId === 'vpc' ? 'rgba(37, 99, 235, 0.04)' : 'var(--bg-card)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            position: 'relative',
            cursor: 'pointer',
            transition: 'var(--transition)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '0.8rem', color: 'var(--primary-blue)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              <Shield size={16} />
              <span>Custom Amazon VPC (CIDR 10.0.0.0/16)</span>
            </div>
            <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>vpc-02f2b721ab4ad3f5d</span>
          </div>

          {/* Subnet 1: Public Subnet (ALB Ingress) */}
          <div
            style={{
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--border-subtle)',
              border: '1px solid var(--border)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Public Subnet (10.0.1.0/24 • Internet Gateway)</span>
              <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>sg-alb (80/443)</span>
            </div>
            <div style={{ fontSize: '0.825rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span>Application Load Balancer (ALB)</span>
              <ArrowRight size={14} color="var(--primary-blue)" />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Health Checked Reverse Proxy</span>
            </div>
          </div>

          {/* Subnet 2: Private Application Subnet (EC2 Compute Tier) */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              onSelectNode('ec2');
            }}
            style={{
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              border: selectedNodeId === 'ec2' ? '2px solid var(--primary-blue)' : '1px solid var(--border)',
              backgroundColor: 'var(--bg-elevated)',
              boxShadow: selectedNodeId === 'ec2' ? '0 0 16px var(--primary-glow)' : 'var(--shadow-xs)',
              cursor: 'pointer',
              transition: 'var(--transition)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-blue)' }}>Private App Subnet (10.0.10.0/24)</span>
              <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>sg-ec2 (Inbound :5001 from ALB)</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: 'var(--radius-sm)', background: 'var(--primary-subtle)', color: 'var(--primary-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Server size={18} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.95rem' }}>Amazon EC2 Compute Tier</h4>
                <span style={{ fontSize: '0.725rem', color: 'var(--text-secondary)' }}>t3.micro • IAM Profile: MediCloud-EC2-AppRole</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.6rem', fontSize: '0.725rem' }}>
              <div style={{ padding: '0.45rem', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
                <strong>Node.js/Express API</strong>
                <span style={{ display: 'block', color: 'var(--text-muted)' }}>Port 5001 • REST Auth</span>
              </div>
              <div style={{ padding: '0.45rem', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
                <strong>SQS Document Worker</strong>
                <span style={{ display: 'block', color: 'var(--text-muted)' }}>Background OCR Daemon</span>
              </div>
            </div>
          </div>

          {/* Subnet 3: Private Database Subnet (PostgreSQL 16) */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              onSelectNode('rds');
            }}
            style={{
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              border: selectedNodeId === 'rds' ? '2px solid var(--primary-blue)' : '1px solid var(--border)',
              backgroundColor: 'var(--bg-elevated)',
              boxShadow: selectedNodeId === 'rds' ? '0 0 16px var(--primary-glow)' : 'var(--shadow-xs)',
              cursor: 'pointer',
              transition: 'var(--transition)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--error)' }}>Isolated Database Subnet (10.0.20.0/24)</span>
              <span className="badge badge-error" style={{ fontSize: '0.65rem' }}>sg-rds (5432 strictly from EC2)</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: 'var(--radius-sm)', background: 'var(--error-bg)', color: 'var(--error)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Database size={18} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.95rem' }}>Amazon RDS PostgreSQL 16</h4>
                <span style={{ fontSize: '0.725rem', color: 'var(--text-secondary)' }}>db.t3.micro • Zero Public Route Access</span>
              </div>
            </div>

            <div style={{ marginTop: '0.6rem', padding: '0.5rem', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-xs)', fontSize: '0.725rem', color: 'var(--text-secondary)' }}>
              🔒 <strong>Concurrency Protection:</strong> <code>SELECT ... FOR UPDATE</code> row locks prevent double-booking.
            </div>
          </div>
        </div>

        {/* ==================================================================== */}
        {/* COLUMN 3: AWS MANAGED CLOUD SERVICES TIER */}
        {/* ==================================================================== */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Cloud size={14} />
            <span>AWS Managed Cloud Tier</span>
          </div>

          {/* Amazon S3 Bucket */}
          <div
            onClick={() => onSelectNode('s3')}
            style={{
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: selectedNodeId === 's3' ? '2px solid var(--primary-blue)' : '1px solid var(--border)',
              backgroundColor: 'var(--bg-card)',
              boxShadow: selectedNodeId === 's3' ? '0 0 16px var(--primary-glow)' : 'var(--shadow-xs)',
              cursor: 'pointer',
              transition: 'var(--transition)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.85rem' }}>
                <Lock size={15} color="var(--success)" />
                <span>Amazon S3 Vault</span>
              </div>
              <span className="badge badge-success" style={{ fontSize: '0.625rem' }}>AES256</span>
            </div>
            <div style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              Direct client upload via SigV4 presigned URLs. Block Public Access enabled.
            </div>
          </div>

          {/* Amazon SQS Queue & DLQ */}
          <div
            onClick={() => onSelectNode('sqs')}
            style={{
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: selectedNodeId === 'sqs' ? '2px solid var(--primary-blue)' : '1px solid var(--border)',
              backgroundColor: 'var(--bg-card)',
              boxShadow: selectedNodeId === 'sqs' ? '0 0 16px var(--primary-glow)' : 'var(--shadow-xs)',
              cursor: 'pointer',
              transition: 'var(--transition)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.85rem' }}>
                <Activity size={15} color="var(--warning)" />
                <span>Amazon SQS + DLQ</span>
              </div>
              <span className="badge badge-warning" style={{ fontSize: '0.625rem' }}>20s Long-Poll</span>
            </div>
            <div style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              Decoupled worker queue. Poison messages redrive to DLQ after 3 failures.
            </div>
          </div>

          {/* Amazon SNS Topic */}
          <div
            onClick={() => onSelectNode('sns')}
            style={{
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: selectedNodeId === 'sns' ? '2px solid var(--primary-blue)' : '1px solid var(--border)',
              backgroundColor: 'var(--bg-card)',
              boxShadow: selectedNodeId === 'sns' ? '0 0 16px var(--primary-glow)' : 'var(--shadow-xs)',
              cursor: 'pointer',
              transition: 'var(--transition)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.85rem' }}>
                <Bell size={15} color="#A855F7" />
                <span>Amazon SNS Bus</span>
              </div>
              <span className="badge badge-neutral" style={{ fontSize: '0.625rem' }}>Pub/Sub</span>
            </div>
            <div style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              Broadcasts appointment alerts and CloudWatch operational alarms to email.
            </div>
          </div>

          {/* CloudWatch Alarms & AWS Budgets */}
          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--border-subtle)',
              border: '1px solid var(--border)',
              fontSize: '0.725rem',
            }}
          >
            <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.2rem' }}>
              CloudWatch & AWS Budgets
            </div>
            <div style={{ color: 'var(--text-secondary)' }}>
              Queue depth alarm (&ge;10 msgs) • $15 monthly spending alert (85% trigger).
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
