/** @format */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import './dashboard.css';

function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="dashboard-page">
      <h1>Welcome to Your Dashboard</h1>
      {user.email}

      {user?.role?.toLowerCase() === 'patient' && (
        <div className="dashboard-actions">
          <button className="btn" onClick={() => navigate('/my-reports')}>
            View Patient Report
          </button>
          <button
            className="btn-outline"
            onClick={() => navigate('/lab-order')}
          >
            Order Labs
          </button>
          <button
            className="btn-outline"
            onClick={() => navigate('/screening-order')}
          >
            Screening Tests
          </button>
        </div>
      )}
      {['admin', 'superadmin'].includes(user?.role?.toLowerCase()) && (
        <div className="mt-4">
          <a href="/intake-form" className="btn">
            Start Patient Intake
          </a>
          <div className="admin-actions mt-4">
            <button
              className="btn-outline"
              onClick={() => navigate('/admin/users')}
            >
              Manage Users
            </button>
            <button
              className="btn-outline"
              onClick={() => navigate('/admin/logs')}
            >
              View Audit Logs
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
