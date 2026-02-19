// client/src/pages/Register.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaEnvelope, FaPhone, FaLock, FaEye, FaEyeSlash, FaUserPlus } from 'react-icons/fa';
import '../styles/pages.css';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signup(formData);
      navigate('/events');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container card animate-fade-in">
        <div className="auth-header">
          <div className="auth-icon">
            <FaUserPlus size={48} color="#fff" />
          </div>
          <h1 className="animate-slide-left">Join Our Community</h1>
          <p className="auth-subtitle animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Create your volunteer account and start making a difference
          </p>
        </div>
        
        {error && (
          <div className="error-message animate-slide-left">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <label htmlFor="name">
              <FaUser size={16} />
              Full Name
            </label>
            <input 
              type="text" 
              name="name" 
              id="name"
              value={formData.name} 
              onChange={handleChange} 
              placeholder="Enter your full name"
              required 
            />
          </div>
          
          <div className="form-group animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <label htmlFor="email">
              <FaEnvelope size={16} />
              Email Address
            </label>
            <input 
              type="email" 
              name="email" 
              id="email"
              value={formData.email} 
              onChange={handleChange} 
              placeholder="Enter your email"
              required 
            />
          </div>
          
          <div className="form-group animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <label htmlFor="phone">
              <FaPhone size={16} />
              Phone Number
            </label>
            <input 
              type="tel" 
              name="phone" 
              id="phone"
              value={formData.phone} 
              onChange={handleChange} 
              placeholder="Enter your phone number"
              pattern="[0-9]{10,15}" 
              required 
            />
          </div>
          
          <div className="form-group animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <label htmlFor="password">
              <FaLock size={16} />
              Password
            </label>
            <div className="password-input-container">
              <input 
                type={showPassword ? "text" : "password"} 
                name="password" 
                id="password"
                value={formData.password} 
                onChange={handleChange} 
                placeholder="Create a strong password"
                required 
              />
              <button 
                type="button" 
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
              </button>
            </div>
          </div>
          
          <button 
            type="submit" 
            className="auth-submit-btn" 
            disabled={loading}
            style={{ animationDelay: '0.7s' }}
          >
            {loading ? (
              <div className="loading-spinner">
                <div className="spinner"></div>
                <span>Creating account...</span>
              </div>
            ) : (
              'Create Account'
            )}
          </button>
        </form>
        
        <div className="auth-footer animate-fade-in" style={{ animationDelay: '0.8s' }}>
          <p className="auth-link">
            Already have an account? <Link to="/login">Sign in here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
