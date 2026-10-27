import React, { useState, useEffect } from 'react';
import { AdminAnalytics, AuditLogItem } from '../../types/index.js';
import { apiRequest } from '../../lib/api.js';
import {
  Activity,
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Users,
  FileText,
  Clock,
  RotateCcw,
  ShieldCheck,
  TrendingUp,
  Cpu,
  RefreshCw,
  Cloud,
  Lock,
  Layers,
  HardDrive,
  Bell,
  DollarSign,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [analyticsData, logsData] = await Promise.all([
        apiRequest<AdminAnalytics>('/admin/analytics'),
        apiRequest<AuditLogItem[]>('/admin/audit-logs?limit=15'),
      ]);
      setAnalytics(analyticsData);
      setAuditLogs(logsData);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
            <span className="cloud-beacon">
              <span className="beacon-dot" />
              <span>AWS Cloud Infrastructure Active</span>
            </span>
          </div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.35rem' }}>Platform Governance & Cloud Telemetry</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Live healthcare operations and infrastructure metrics aggregated from Amazon RDS PostgreSQL, S3, and Amazon SQS queues.
          </p>
        </div>
        <button onClick={fetchDashboardData} className="btn btn-outline" style={{ gap: '0.5rem', padding: '0.65rem 1.25rem' }}>
          <RefreshCw size={16} />
          <span>Refresh Cloud Metrics</span>
        </button>
      </div>

      {loading || !analytics ? (
        <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-secondary)' }}>
          <RefreshCw size={36} className="spin" color="var(--primary-blue)" style={{ marginBottom: '1rem' }} />
          <p style={{ fontWeight: 600 }}>Aggregating telemetry from PostgreSQL & SQS...</p>
        </div>
      ) : (
        <>
          {/* Top KPI Cards Grid */}
          <div className="grid-metrics" style={{ marginBottom: '2rem' }}>
            {/* Total Appointments */}
            <div className="card card-featured">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Total Consultations</span>
                <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', background: 'var(--primary-subtle)', color: 'var(--primary-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CalendarCheck size={18} />
                </div>
              </div>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                {analytics.appointments.total}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {analytics.appointments.upcoming} Upcoming • {analytics.appointments.completed} Completed
              </div>
            </div>

            {/* Cancellation Rate */}
            <div className="card card-featured">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Cancellation Rate</span>
                <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', background: 'var(--error-bg)', color: 'var(--error)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <XCircle size={18} />
                </div>
              </div>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                {analytics.appointments.cancellationRatePercent}%
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {analytics.appointments.cancelled} of {analytics.appointments.total} bookings cancelled
              </div>
            </div>

            {/* Doctor Utilization */}
            <div className="card card-featured">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Doctor Utilization</span>
                <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', background: 'var(--teal-subtle)', color: 'var(--secondary-teal)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <TrendingUp size={18} />
                </div>
              </div>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                {analytics.doctorUtilizationPercent}%
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Scheduled consultations vs available slots
              </div>
            </div>

            {/* SQS Document Queue */}
            <div className="card card-featured">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>SQS Queue & OCR</span>
                <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', background: 'var(--info-bg)', color: 'var(--info)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileText size={18} />
                </div>
              </div>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                {analytics.documents.completed}/{analytics.documents.total}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {analytics.documents.queued} In Backlog • {analytics.documents.successRatePercent}% Success
              </div>
            </div>
          </div>

          {/* Middle Row: Specialization Demand & Cloud Architecture Health Status */}
          <div className="grid-2col" style={{ marginBottom: '2.5rem' }}>
            {/* Specialization Demand */}
            <div className="card">
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Activity size={20} color="var(--primary-blue)" />
                <span>Specialization Demand Distribution</span>
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {analytics.specializationDemand.map((spec) => {
                  const maxCount = Math.max(...analytics.specializationDemand.map((s) => s.appointment_count), 1);
                  const percentage = Math.round((spec.appointment_count / maxCount) * 100);

                  return (
                    <div key={spec.specialization}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.35rem' }}>
                        <span style={{ fontWeight: 600 }}>{spec.specialization}</span>
                        <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{spec.appointment_count} visits</span>
                      </div>
                      <div style={{ height: '8px', backgroundColor: 'var(--border-subtle)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                        <div
                          style={{
                            height: '100%',
                            width: `${percentage}%`,
                            background: 'linear-gradient(90deg, var(--primary-blue), var(--secondary-teal))',
                            borderRadius: 'var(--radius-full)',
                            transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* AWS Cloud Architecture Health Status */}
            <div className="card">
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Cloud size={20} color="var(--primary-blue)" />
                <span>AWS Live Cloud Architecture</span>
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', backgroundColor: 'var(--border-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                  <div>
                    <strong>Amazon EC2:</strong> Primary Compute Tier
                    <span style={{ display: 'block', fontSize: '0.725rem', color: 'var(--text-muted)' }}>Node.js / Express 4 API & Background Daemon</span>
                  </div>
                  <span className="badge badge-success">Running</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', backgroundColor: 'var(--border-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                  <div>
                    <strong>Amazon RDS:</strong> PostgreSQL 16
                    <span style={{ display: 'block', fontSize: '0.725rem', color: 'var(--text-muted)' }}>Isolated Subnet • Connection Pool Active</span>
                  </div>
                  <span className="badge badge-success">Available</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', backgroundColor: 'var(--border-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                  <div>
                    <strong>Amazon S3:</strong> Encrypted Bucket
                    <span style={{ display: 'block', fontSize: '0.725rem', color: 'var(--text-muted)' }}>Public Access Blocked • SigV4 Presigned URLs</span>
                  </div>
                  <span className="badge badge-success">AES256</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', backgroundColor: 'var(--border-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                  <div>
                    <strong>Amazon SQS + DLQ:</strong> Asynchronous Queue
                    <span style={{ display: 'block', fontSize: '0.725rem', color: 'var(--text-muted)' }}>Max Receive: 3 • Visibility: 120s</span>
                  </div>
                  <span className="badge badge-info">{analytics.documents.queued} Messages</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', backgroundColor: 'var(--border-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                  <div>
                    <strong>Amazon SNS & CloudWatch:</strong>
                    <span style={{ display: 'block', fontSize: '0.725rem', color: 'var(--text-muted)' }}>Alarms on Queue Depth &gt; 10</span>
                  </div>
                  <span className="badge badge-success">Configured</span>
                </div>
              </div>
            </div>
          </div>

          {/* Audit Logs Trail */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <ShieldCheck size={20} color="var(--primary-blue)" />
                <span>Real-Time Clinical Audit Trail</span>
              </h3>
              <span className="badge badge-neutral" style={{ fontSize: '0.75rem' }}>
                Immutable Audit Log
              </span>
            </div>
            
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Action</th>
                    <th>Actor</th>
                    <th>Resource</th>
                    <th>Outcome</th>
                    <th>Security Context</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log) => (
                    <tr key={log.id}>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                      <td>
                        <span style={{ fontWeight: 700 }}>{log.action}</span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.85rem' }}>{log.actor_name || 'System'}</span>
                      </td>
                      <td>
                        <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
                          {log.resource_type}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${log.outcome === 'SUCCESS' ? 'badge-success' : 'badge-error'}`}>
                          {log.outcome}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.75rem', fontFamily: 'monospace', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {JSON.stringify(log.safe_metadata)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
