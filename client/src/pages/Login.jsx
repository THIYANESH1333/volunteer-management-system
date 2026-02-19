import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/pages.css';
import { useState } from 'react';
import { FaUser, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(formData.email, formData.password);
      navigate('/events');
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container card animate-fade-in">
        <div className="auth-header">
          <div className="auth-icon">
            <FaUser size={48} color="#fff" />
          </div>
          <h1 className="animate-slide-left">Welcome Back</h1>
          <p className="auth-subtitle animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Sign in to your volunteer account
          </p>
        </div>
        
        {error && (
          <div className="error-message animate-slide-left">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <label htmlFor="email">
              <FaUser size={16} />
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
          
          <div className="form-group animate-fade-in" style={{ animationDelay: '0.4s' }}>
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
                placeholder="Enter your password"
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
            style={{ animationDelay: '0.5s' }}
          >
            {loading ? (
              <div className="loading-spinner">
                <div className="spinner"></div>
                <span>Signing in...</span>
              </div>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
        
        <div className="auth-footer animate-fade-in" style={{ animationDelay: '0.6s' }}>
          <p className="auth-link">
            Don't have an account? <Link to="/register">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
