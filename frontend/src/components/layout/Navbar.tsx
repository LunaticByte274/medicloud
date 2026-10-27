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
  Cloud,
  Check,
  ChevronDown,
  Shield,
  Layers,
  Database,
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
  const [showCloudDetails, setShowCloudDetails] = useState<boolean>(false);

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
    const interval = setInterval(fetchNotifications, 15000);
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
        height: '70px',
        borderBottom: '1px solid var(--border-glass)',
        backgroundColor: 'var(--header-bg)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.75rem',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: 'var(--shadow-xs)',
      }}
    >
      {/* Brand Logo & Mobile Menu Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {onMenuToggle && (
          <button
            onClick={onMenuToggle}
            className="btn btn-outline"
            style={{ padding: '0.45rem', display: 'flex', alignItems: 'center', borderRadius: 'var(--radius-md)' }}
            title="Toggle Menu"
          >
            <Menu size={20} />
          </button>
        )}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, var(--primary-blue), var(--secondary-teal))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: '0 4px 12px var(--primary-glow)',
            }}
          >
            <HeartPulse size={24} />
          </div>
          <div>
            <span
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.35rem',
                fontWeight: 800,
                color: 'var(--text-main)',
                letterSpacing: '-0.03em',
              }}
            >
              Medi<span className="gradient-text">Cloud</span>
            </span>
          </div>
        </Link>
      </div>

      {/* Right Controls: Cloud Badge, Theme Toggle, Notifications & User */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        {/* Live AWS Integration Beacon Badge */}
        <div style={{ position: 'relative' }} className="hide-mobile">
          <button
            onClick={() => setShowCloudDetails(!showCloudDetails)}
            className="cloud-beacon"
            style={{ cursor: 'pointer', transition: 'var(--transition)' }}
            title="Click to view Live AWS Cloud Telemetry"
          >
            <span className="beacon-dot" />
            <span>AWS Native • us-east-1</span>
            <ChevronDown size={14} style={{ opacity: 0.7 }} />
          </button>

          {/* Cloud Telemetry Dropdown Card */}
          {showCloudDetails && (
            <div
              className="card"
              style={{
                position: 'absolute',
                right: 0,
                top: '46px',
                width: '360px',
                padding: '1.25rem',
                zIndex: 200,
                boxShadow: 'var(--shadow-lg)',
                border: '1px solid var(--border-glass)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
                <Cloud size={18} color="var(--primary-blue)" />
                <h4 style={{ fontSize: '0.95rem' }}>AWS Cloud Infrastructure</h4>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.8rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.45rem 0.6rem', background: 'var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Account ID:</span>
                  <strong>531988093771</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.45rem 0.6rem', background: 'var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>S3 Document Store:</span>
                  <span className="badge badge-success" style={{ fontSize: '0.675rem' }}>Active AES256</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.45rem 0.6rem', background: 'var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>SQS Worker & DLQ:</span>
                  <span className="badge badge-info" style={{ fontSize: '0.675rem' }}>Long-Polling 20s</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.45rem 0.6rem', background: 'var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Amazon SNS:</span>
                  <span className="badge badge-success" style={{ fontSize: '0.675rem' }}>Subscribed</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.45rem 0.6rem', background: 'var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Custom VPC:</span>
                  <strong>10.0.0.0/16 (2 AZs)</strong>
                </div>
              </div>

              <div style={{ marginTop: '0.85rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                  Authenticated via AWS IAM & CloudFormation
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Theme Switcher Button */}
        <button
          onClick={toggleTheme}
          className="btn btn-outline"
          style={{
            padding: '0.5rem',
            borderRadius: 'var(--radius-full)',
            color: 'var(--text-main)',
          }}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <Sun size={19} color="#FBBF24" /> : <Moon size={19} />}
        </button>

        {/* Notifications Dropdown */}
        {user && (
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowNotifMenu(!showNotifMenu)}
              className="btn btn-outline"
              style={{
                position: 'relative',
                padding: '0.5rem',
                borderRadius: 'var(--radius-full)',
              }}
              title="Notifications"
            >
              <Bell size={19} />
              {unreadCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-3px',
                    right: '-3px',
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
                    boxShadow: '0 0 6px var(--error)',
                  }}
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifMenu && (
              <div
                className="card"
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '46px',
                  width: '330px',
                  padding: '1.25rem',
                  zIndex: 200,
                  boxShadow: 'var(--shadow-lg)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                  <h4 style={{ fontSize: '0.95rem' }}>Notifications</h4>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      style={{ fontSize: '0.75rem', color: 'var(--primary-blue)', cursor: 'pointer', fontWeight: 600 }}
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                {notifications.length === 0 ? (
                  <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', textAlign: 'center', padding: '1.5rem 0' }}>
                    No notifications
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '300px', overflowY: 'auto' }}>
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        style={{
                          padding: '0.7rem',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: n.read_at ? 'transparent' : 'var(--primary-subtle)',
                          border: '1px solid var(--border-subtle)',
                          fontSize: '0.8rem',
                          transition: 'var(--transition-fast)',
                        }}
                      >
                        <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.2rem' }}>{n.title}</div>
                        <div style={{ color: 'var(--text-secondary)', marginBottom: '0.35rem', lineHeight: 1.4 }}>{n.message}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div style={{ marginTop: '0.85rem', textAlign: 'center', paddingTop: '0.6rem', borderTop: '1px solid var(--border-subtle)' }}>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                padding: '0.35rem 0.85rem',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--bg-glass)',
                border: '1px solid var(--border)',
                fontSize: '0.85rem',
                backdropFilter: 'blur(8px)',
              }}
            >
              <div
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: 'var(--radius-full)',
                  background: 'linear-gradient(135deg, var(--primary-blue), var(--secondary-teal))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                }}
              >
                {user.name.charAt(0)}
              </div>
              <span style={{ fontWeight: 600 }} className="hide-mobile">{user.name}</span>
              <span className={`badge ${user.role === 'ADMIN' ? 'badge-error' : user.role === 'DOCTOR' ? 'badge-info' : 'badge-success'}`} style={{ fontSize: '0.675rem' }}>
                {user.role}
              </span>
            </div>

            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="btn btn-outline"
              style={{ padding: '0.5rem', borderRadius: 'var(--radius-full)' }}
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        ) : (
          <Link to="/login" className="btn btn-primary" style={{ padding: '0.5rem 1.15rem' }}>
            Login
          </Link>
        )}
      </div>
    </header>
  );
};
