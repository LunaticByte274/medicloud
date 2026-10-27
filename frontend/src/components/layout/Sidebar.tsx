import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import {
  LayoutDashboard,
  Search,
  CalendarCheck,
  FileText,
  Clock,
  Users,
  ShieldAlert,
  Bell,
  UserCheck,
  Stethoscope,
  Activity,
  HardDrive,
  Cpu,
  Layers,
} from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = true }) => {
  const { user } = useAuth();
  if (!user) return null;

  const role = user.role;

  const patientLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/doctors', label: 'Find Doctors', icon: Search },
    { to: '/appointments', label: 'My Appointments', icon: CalendarCheck },
    { to: '/documents', label: 'Medical Documents', icon: FileText },
    { to: '/notifications', label: 'Notifications', icon: Bell },
    { to: '/profile', label: 'My Health Profile', icon: UserCheck },
  ];

  const doctorLinks = [
    { to: '/dashboard', label: 'Doctor Schedule', icon: LayoutDashboard },
    { to: '/appointments', label: 'Patient Consultations', icon: CalendarCheck },
    { to: '/availability', label: 'Manage Availability', icon: Clock },
    { to: '/documents', label: 'Medical Reports', icon: FileText },
    { to: '/notifications', label: 'Notifications', icon: Bell },
    { to: '/profile', label: 'Doctor Profile', icon: Stethoscope },
  ];

  const adminLinks = [
    { to: '/dashboard', label: 'System Analytics', icon: Activity },
    { to: '/admin/users', label: 'User Directory', icon: Users },
    { to: '/doctors', label: 'Doctors & Onboarding', icon: Stethoscope },
    { to: '/appointments', label: 'All Appointments', icon: CalendarCheck },
    { to: '/documents', label: 'Document Jobs & Queue', icon: FileText },
    { to: '/admin/audit', label: 'Audit Trail', icon: ShieldAlert },
    { to: '/notifications', label: 'System Alerts', icon: Bell },
  ];

  const links = role === 'ADMIN' ? adminLinks : role === 'DOCTOR' ? doctorLinks : patientLinks;

  return (
    <aside
      style={{
        width: '260px',
        backgroundColor: 'var(--sidebar-bg)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderRight: '1px solid var(--border-glass)',
        minHeight: 'calc(100vh - 70px)',
        padding: '1.75rem 1rem',
        display: isOpen ? 'flex' : 'none',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'var(--transition)',
        position: 'sticky',
        top: '70px',
        height: 'calc(100vh - 70px)',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        <div
          style={{
            padding: '0 0.75rem 0.85rem',
            fontSize: '0.725rem',
            fontWeight: 800,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          {role === 'ADMIN' ? 'Platform Governance' : role === 'DOCTOR' ? 'Clinical Workspace' : 'Patient Services'}
        </div>

        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.7rem 0.95rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                fontWeight: isActive ? 600 : 500,
                textDecoration: 'none',
                color: isActive ? 'var(--primary-blue)' : 'var(--text-secondary)',
                backgroundColor: isActive ? 'var(--primary-subtle)' : 'transparent',
                border: isActive ? '1px solid rgba(96, 165, 250, 0.25)' : '1px solid transparent',
                boxShadow: isActive ? '0 2px 8px var(--primary-glow)' : 'none',
                transition: 'var(--transition-fast)',
              })}
            >
              <Icon size={19} />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Cloud Architecture Mini Telemetry Box */}
      <div
        style={{
          padding: '1rem',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--border-subtle)',
          border: '1px solid var(--border-glass)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-main)' }}>
            <Layers size={14} color="var(--primary-blue)" />
            <span>AWS Infrastructure</span>
          </div>
          <span className="beacon-dot" style={{ width: '6px', height: '6px' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>S3 Private Bucket</span>
            <strong style={{ color: 'var(--success)' }}>AES256</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Amazon SQS & DLQ</span>
            <strong style={{ color: 'var(--primary-blue)' }}>Long-Poll</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>PostgreSQL 16 DB</span>
            <strong style={{ color: 'var(--success)' }}>Online</strong>
          </div>
        </div>
      </div>
    </aside>
  );
};
