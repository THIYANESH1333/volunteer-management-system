import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { FaUsers, FaClock, FaCalendarAlt, FaHeart } from 'react-icons/fa';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title animate-fade-in">
        Welcome to Volunteer Dashboard
      </h1>

      <div className="dashboard-welcome-card animate-slide-left">
        <div className="welcome-icon">
          <FaHeart size={48} color="#fff" />
        </div>
        <h2>Hello, {user?.name || 'Volunteer'}!</h2>
        <p>Thank you for contributing your time and effort. You make a difference in our community!</p>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="stat-icon">
            <FaUsers size={32} color="#fff" />
          </div>
          <h3>Events Joined</h3>
          <p className="stat-number">12</p>
        </div>
        <div className="stat-card animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <div className="stat-icon">
            <FaClock size={32} color="#fff" />
          </div>
          <h3>Total Hours</h3>
          <p className="stat-number">48 hrs</p>
        </div>
        <div className="stat-card animate-fade-in" style={{ animationDelay: '0.6s' }}>
          <div className="stat-icon">
            <FaCalendarAlt size={32} color="#fff" />
          </div>
          <h3>Upcoming Events</h3>
          <p className="stat-number">2</p>
        </div>
      </div>

      <div className="recent-events animate-slide-right">
        <h2>Recent Events</h2>
        <ul className="events-list">
          <li className="event-item">
            <span className="event-emoji">🌿</span>
            <span className="event-text">Tree Plantation Drive – June 15</span>
          </li>
          <li className="event-item">
            <span className="event-emoji">📚</span>
            <span className="event-text">Book Donation Camp – June 22</span>
          </li>
          <li className="event-item">
            <span className="event-emoji">🧹</span>
            <span className="event-text">Clean City Campaign – July 3</span>
          </li>
        </ul>
      </div>

      <div className="quick-actions animate-fade-in" style={{ animationDelay: '0.8s' }}>
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <Link to="/events" className="action-btn">
            <FaCalendarAlt size={20} />
            <span>Browse Events</span>
          </Link>
          <Link to="/report-problem" className="action-btn">
            <FaHeart size={20} />
            <span>Report Issue</span>
          </Link>
          <Link to="/profile" className="action-btn">
            <FaUsers size={20} />
            <span>Update Profile</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
