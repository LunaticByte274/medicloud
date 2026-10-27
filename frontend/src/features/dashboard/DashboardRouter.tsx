import React from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { PatientDashboard } from '../patients/PatientDashboard.js';
import { DoctorDashboard } from '../doctors/DoctorDashboard.js';
import { AdminDashboard } from '../admin/AdminDashboard.js';

export const DashboardRouter: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  if (user.role === 'ADMIN') {
    return <AdminDashboard />;
  }

  if (user.role === 'DOCTOR') {
    return <DoctorDashboard />;
  }

  return <PatientDashboard />;
};
