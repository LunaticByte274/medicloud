import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { useTheme } from '../../context/ThemeContext.js';
import { Link, useNavigate } from 'react-router-dom';
import {
  HeartPulse,
  Sun,
  Moon,
  Bell,
  LogOut,
  User as UserIcon,
  CheckCircle2,
  Clock,
  Menu,
} from 'lucide-react';
import { apiRequest } from '../../lib/api.js';
import { NotificationItem } from '../../types/index.js';

export const Navbar: React.FC<{ onMenuToggle?: () => void }> = ({ onMenuToggle }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifMenu, setShowNotifMenu] = useState<boolean>(false);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const data = await apiRequest<{ notifications: NotificationItem[]; unreadCount: number }>('/notifications');
      setNotifications(data.notifications.slice(0, 5));
      setUnreadCount(data.unreadCount);
    } catch (err) {
      // Non-blocking notification fetch
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // Poll every 15s
    return () => clearInterval(interval);
  }, [user]);

  const handleMarkAllRead = async () => {
    try {
      await apiRequest('/notifications/read-all', { method: 'PUT' });
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read_at: new Date().toISOString() })));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header
      style={{
        height: '68px',
        borderBottom: '1px solid var(--border)',
        backgroundColor: 'var(--bg-card)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.5rem',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {onMenuToggle && (
          <button
            onClick={onMenuToggle}
            className="btn btn-outline"
            style={{ padding: '0.4rem', display: 'flex', alignItems: 'center' }}
            title="Toggle Menu"
          >
            <Menu size={20} />
          </button>
        )}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, var(--primary-blue), var(--secondary-teal))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
            }}
          >
            <HeartPulse size={22} />
          </div>
          <div>
            <span
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.25rem',
                fontWeight: 800,
                color: 'var(--text-main)',
                letterSpacing: '-0.03em',
              }}
            >
              Medi<span style={{ color: 'var(--primary-blue)' }}>Cloud</span>
            </span>
          </div>
        </Link>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Theme Switcher Button */}
        <button
          onClick={toggleTheme}
          className="btn btn-outline"
          style={{
            padding: '0.45rem',
            borderRadius: 'var(--radius-full)',
            color: 'var(--text-main)',
          }}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
        </button>

        {/* Notifications Dropdown */}
        {user && (
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowNotifMenu(!showNotifMenu)}
              className="btn btn-outline"
              style={{
                position: 'relative',
                padding: '0.45rem',
                borderRadius: 'var(--radius-full)',
              }}
              title="Notifications"
            >
              <Bell size={19} />
              {unreadCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    backgroundColor: 'var(--error)',
                    color: '#fff',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    width: '18px',
                    height: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifMenu && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '46px',
                  width: '320px',
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-lg)',
                  padding: '1rem',
                  zIndex: 200,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <h4 style={{ fontSize: '0.95rem' }}>Notifications</h4>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      style={{ fontSize: '0.75rem', color: 'var(--primary-blue)', cursor: 'pointer' }}
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                {notifications.length === 0 ? (
                  <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', textAlign: 'center', padding: '1rem 0' }}>
                    No notifications
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '300px', overflowY: 'auto' }}>
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        style={{
                          padding: '0.6rem',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: n.read_at ? 'transparent' : 'var(--primary-subtle)',
                          borderBottom: '1px solid var(--border-subtle)',
                          fontSize: '0.8rem',
                        }}
                      >
                        <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.2rem' }}>{n.title}</div>
                        <div style={{ color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>{n.message}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div style={{ marginTop: '0.75rem', textAlign: 'center' }}>
                  <Link
                    to="/notifications"
                    onClick={() => setShowNotifMenu(false)}
                    style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary-blue)' }}
                  >
                    View all notifications →
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* User Details & Logout */}
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.3rem 0.75rem',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--border-subtle)',
                fontSize: '0.85rem',
              }}
            >
              <UserIcon size={16} />
              <span style={{ fontWeight: 600 }}>{user.name}</span>
              <span className={`badge ${user.role === 'ADMIN' ? 'badge-error' : user.role === 'DOCTOR' ? 'badge-info' : 'badge-success'}`}>
                {user.role}
              </span>
            </div>

            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="btn btn-outline"
              style={{ padding: '0.45rem', borderRadius: 'var(--radius-full)' }}
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        ) : (
          <Link to="/login" className="btn btn-primary" style={{ padding: '0.45rem 1rem' }}>
            Login
          </Link>
        )}
      </div>
    </header>
  );
};
