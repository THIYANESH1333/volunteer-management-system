import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '@/utils/api.js';
import './Admin.css';
import { FaUsers, FaCalendarAlt, FaClipboardList, FaExclamationTriangle, FaCrown } from 'react-icons/fa';

const AdminDashboard = () => {
  const [counts, setCounts] = useState({ users: 0, events: 0, registrations: 0, problems: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [usersRes, eventsRes, regsRes, problemsRes] = await Promise.all([
          api.get('/users'),
          api.get('/events'),
          api.get('/registrations/all'),
          api.get('/problems'),
        ]);
        setCounts({
          users: usersRes.data.length,
          events: eventsRes.data.length,
          registrations: regsRes.data.length,
          problems: problemsRes.data.length,
        });
      } catch {
        setCounts({ users: 0, events: 0, registrations: 0, problems: 0 });
      } finally {
        setLoading(false);
      }
    };
    fetchCounts();
  }, []);

  if (loading) {
    return (
      <div className="admin-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div className="admin-title-section">
          <FaCrown className="admin-crown-icon" />
          <h1 className="admin-title">Admin Dashboard</h1>
        </div>
        <p className="admin-subtitle">Welcome Admin! You can manage users, events, and registrations from here.</p>
      </div>
      
      <div className="admin-dashboard-grid">
        <div className="admin-dashboard-card users-card animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="admin-dashboard-icon">
            <FaUsers />
          </div>
          <div className="admin-card-content">
            <h2 className="admin-card-number">{counts.users}</h2>
            <p className="admin-card-label">Users</p>
            <p className="admin-card-description">Manage volunteer accounts and permissions</p>
          </div>
          <Link to="/admin/users" className="admin-card-btn">
            Manage Users
          </Link>
        </div>
        
        <div className="admin-dashboard-card events-card animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="admin-dashboard-icon">
            <FaCalendarAlt />
          </div>
          <div className="admin-card-content">
            <h2 className="admin-card-number">{counts.events}</h2>
            <p className="admin-card-label">Events</p>
            <p className="admin-card-description">Create and manage volunteer opportunities</p>
          </div>
          <Link to="/admin/events" className="admin-card-btn">
            Manage Events
          </Link>
        </div>
        
        <div className="admin-dashboard-card regs-card animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <div className="admin-dashboard-icon">
            <FaClipboardList />
          </div>
          <div className="admin-card-content">
            <h2 className="admin-card-number">{counts.registrations}</h2>
            <p className="admin-card-label">Registrations</p>
            <p className="admin-card-description">Track volunteer participation and attendance</p>
          </div>
          <Link to="/admin/registrations" className="admin-card-btn">
            View Registrations
          </Link>
        </div>
        
        <div className="admin-dashboard-card problems-card animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <div className="admin-dashboard-icon">
            <FaExclamationTriangle />
          </div>
          <div className="admin-card-content">
            <h2 className="admin-card-number">{counts.problems}</h2>
            <p className="admin-card-label">Reported Problems</p>
            <p className="admin-card-description">Review and address community issues</p>
          </div>
          <Link to="/admin/problems" className="admin-card-btn">
            View Problems
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
