import React, { useState, useEffect } from 'react';
import { NotificationItem } from '../../types/index.js';
import { apiRequest } from '../../lib/api.js';
import { Bell, CheckCircle2, Clock, Check, RefreshCw } from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await apiRequest<{ notifications: NotificationItem[]; unreadCount: number }>('/notifications');
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await apiRequest(`/notifications/${id}/read`, { method: 'PUT' });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await apiRequest('/notifications/read-all', { method: 'PUT' });
      setNotifications((prev) => prev.map((n) => ({ ...n, read_at: new Date().toISOString() })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '0.35rem' }}>Notification Activity Stream</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Event notifications dispatched via Amazon SNS and stored in PostgreSQL for immediate retrieval.
          </p>
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllAsRead} className="btn btn-outline" style={{ gap: '0.5rem' }}>
            <Check size={16} />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-secondary)' }}>
          <p>Loading notification events...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 2rem', color: 'var(--text-secondary)' }}>
          <Bell size={42} style={{ opacity: 0.3, marginBottom: '1rem' }} />
          <h3>No notifications recorded</h3>
          <p style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>
            You will receive instant alerts for appointment confirmations, cancellations, and processed lab reports.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {notifications.map((n) => {
            const isUnread = !n.read_at;
            return (
              <div
                key={n.id}
                className="card"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1.25rem',
                  backgroundColor: isUnread ? 'var(--primary-subtle)' : 'var(--bg-card)',
                  borderLeft: `4px solid ${isUnread ? 'var(--primary-blue)' : 'var(--border)'}`,
                  transition: 'var(--transition)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{n.title}</span>
                    <span className="badge badge-neutral" style={{ fontSize: '0.65rem' }}>
                      {n.event_type}
                    </span>
                    {isUnread && <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>New</span>}
                  </div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                    {n.message}
                  </p>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Clock size={12} />
                    <span>{new Date(n.created_at).toLocaleString()}</span>
                  </div>
                </div>

                {isUnread && (
                  <button
                    onClick={() => handleMarkAsRead(n.id)}
                    className="btn btn-outline"
                    style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
                    title="Mark as Read"
                  >
                    <Check size={14} />
                    <span>Read</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
