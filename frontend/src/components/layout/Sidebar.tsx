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
        width: '240px',
        backgroundColor: 'var(--bg-card)',
        borderRight: '1px solid var(--border)',
        minHeight: 'calc(100vh - 68px)',
        padding: '1.5rem 1rem',
        display: isOpen ? 'flex' : 'none',
        flexDirection: 'column',
        gap: '0.35rem',
      }}
    >
      <div style={{ padding: '0 0.5rem 0.75rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
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
              padding: '0.65rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.875rem',
              fontWeight: isActive ? 600 : 500,
              textDecoration: 'none',
              color: isActive ? 'var(--primary-blue)' : 'var(--text-secondary)',
              backgroundColor: isActive ? 'var(--primary-subtle)' : 'transparent',
              transition: 'var(--transition)',
            })}
          >
            <Icon size={18} />
            <span>{link.label}</span>
          </NavLink>
        );
      })}
    </aside>
  );
};
