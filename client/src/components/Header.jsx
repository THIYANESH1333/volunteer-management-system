import { useAuth } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa';
import '../styles/components.css';

// Custom Logo Component
const VolunteerLogo = () => (
  <div className="volunteer-logo">
    <div className="logo-heart">
      <div className="heart-shape">
        <div className="handshake-hands">
          <div className="left-hand"></div>
          <div className="right-hand"></div>
        </div>
      </div>
    </div>
    <div className="logo-text-container">
      <span className="logo-text-volunteer">Volunteer</span>
      <span className="logo-text-community">COMMUNITY</span>
    </div>
  </div>
);

const Header = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navLinks = [
    { to: '/admin/dashboard', label: 'Admin', admin: true },
    { to: '/events', label: 'Events' },
    { to: '/profile', label: 'Profile' },
  ];

  return (
    <header className="main-navbar">
      <div className="navbar-content">
        <div className="navbar-logo">
          <VolunteerLogo />
        </div>
        <nav className="navbar-links">
          {navLinks.map(
            link =>
              (!link.admin || (user && user.role === 'admin')) && (
                <Link
                  key={link.to}
                  to={link.to}
                  className={
                    'nav-link' + (location.pathname.startsWith(link.to) ? ' active' : '')
                  }
                >
                  {link.label}
                </Link>
              )
          )}
          {user && user.role === 'volunteer' && (
            <>
              <Link to="/report-problem" className={
                'nav-link' + (location.pathname.startsWith('/report-problem') ? ' active' : '')
              }>Report Problem</Link>
              <Link to="/my-reports" className={
                'nav-link' + (location.pathname.startsWith('/my-reports') ? ' active' : '')
              }>My Reports</Link>
            </>
          )}
        </nav>
        <div className="navbar-user">
          {user && (
            <span className="navbar-username">
              {user.profilePicUrl ? (
                <img src={user.profilePicUrl} alt="Profile" className="navbar-profile-pic" />
              ) : user.name ? (
                <span className="user-avatar">{user.name[0].toUpperCase()}</span>
              ) : (
                <span className="user-avatar"><FaUserCircle size={24} /></span>
              )}
              <span style={{ marginLeft: 8 }}>{user.name} ({user.role})</span>
            </span>
          )}
          <button className="btn logout-btn" onClick={logout} tabIndex={0}>
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header; 