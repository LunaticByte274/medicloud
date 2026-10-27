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
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [retryLoading, setRetryLoading] = useState<boolean>(false);

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '0.35rem' }}>Cloud Infrastructure & System Analytics</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Live platform metrics aggregated directly from Amazon RDS PostgreSQL and Amazon SQS queues.
          </p>
        </div>
        <button onClick={fetchDashboardData} className="btn btn-outline" style={{ gap: '0.5rem' }}>
          <RefreshCw size={16} />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {loading || !analytics ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-secondary)' }}>
          <p>Aggregating cloud metrics...</p>
        </div>
      ) : (
        <>
          {/* Top KPI Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
            {/* Total Appointments */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Total Appointments</span>
                <CalendarCheck size={20} color="var(--primary-blue)" />
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                {analytics.appointments.total}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {analytics.appointments.upcoming} Upcoming • {analytics.appointments.completed} Completed
              </div>
            </div>

            {/* Cancellation Rate */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Cancellation Rate</span>
                <XCircle size={20} color="var(--error)" />
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                {analytics.appointments.cancellationRatePercent}%
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {analytics.appointments.cancelled} of {analytics.appointments.total} consultations cancelled
              </div>
            </div>

            {/* Doctor Utilization */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Doctor Utilization</span>
                <TrendingUp size={20} color="var(--secondary-teal)" />
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                {analytics.doctorUtilizationPercent}%
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Scheduled vs created clinical slots
              </div>
            </div>

            {/* SQS Document Queue */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>SQS Queue & OCR</span>
                <FileText size={20} color="var(--info)" />
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                {analytics.documents.completed}/{analytics.documents.total}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {analytics.documents.queued} In Backlog • {analytics.documents.successRatePercent}% Success Rate
              </div>
            </div>
          </div>

          {/* Middle Row: Specialization Demand & Cloud Resource Status */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2.5rem' }}>
            {/* Specialization Demand */}
            <div className="card">
              <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Activity size={18} color="var(--primary-blue)" />
                <span>Specialization Demand Distribution</span>
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {analytics.specializationDemand.map((spec) => {
                  const maxCount = Math.max(...analytics.specializationDemand.map((s) => s.appointment_count), 1);
                  const percentage = Math.round((spec.appointment_count / maxCount) * 100);

                  return (
                    <div key={spec.specialization}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                        <span style={{ fontWeight: 600 }}>{spec.specialization}</span>
                        <span style={{ color: 'var(--text-secondary)' }}>{spec.appointment_count} visits</span>
                      </div>
                      <div style={{ height: '8px', backgroundColor: 'var(--border-subtle)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                        <div
                          style={{
                            height: '100%',
                            width: `${percentage}%`,
                            backgroundColor: 'var(--primary-blue)',
                            borderRadius: 'var(--radius-full)',
                            transition: 'width 0.5s ease',
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
              <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Cpu size={18} color="var(--secondary-teal)" />
                <span>AWS Cloud Infrastructure Status</span>
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0.85rem', backgroundColor: 'var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
                  <div><strong>Amazon EC2:</strong> Primary Node.js/Express Compute</div>
                  <span className="badge badge-success">Running</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0.85rem', backgroundColor: 'var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
                  <div><strong>Amazon RDS:</strong> PostgreSQL 16 Managed DB</div>
                  <span className="badge badge-success">Available</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0.85rem', backgroundColor: 'var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
                  <div><strong>Amazon S3:</strong> Encrypted Document Storage</div>
                  <span className="badge badge-success">Private & Blocked</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0.85rem', backgroundColor: 'var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
                  <div><strong>Amazon SQS:</strong> Document Ingestion & Worker Queue</div>
                  <span className="badge badge-info">{analytics.documents.queued} Messages</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0.85rem', backgroundColor: 'var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
                  <div><strong>AWS Budgets:</strong> Spending Alert ($15 Threshold)</div>
                  <span className="badge badge-success">Configured</span>
                </div>
              </div>
            </div>
          </div>

          {/* Audit Logs Trail */}
          <div className="card">
            <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={18} color="var(--primary-blue)" />
              <span>Real-Time System Audit Trail</span>
            </h3>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Action</th>
                    <th>Actor</th>
                    <th>Resource</th>
                    <th>Outcome</th>
                    <th>Metadata</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log) => (
                    <tr key={log.id}>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {new Date(log.created_at).toLocaleTimeString()}
                      </td>
                      <td>
                        <span style={{ fontWeight: 600 }}>{log.action}</span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.8rem' }}>{log.actor_name || 'System / Guest'}</span>
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
                      <td style={{ fontSize: '0.75rem', fontFamily: 'monospace', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
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
