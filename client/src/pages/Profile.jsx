import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import '../styles/pages.css';
import { FaUser, FaEnvelope, FaPhone, FaUserTag, FaEdit, FaSave, FaTimes, FaCamera } from 'react-icons/fa';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', phone: '' });
    const [profilePic, setProfilePic] = useState(null);
    const [previewPic, setPreviewPic] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const res = await api.get('/users/me');
            setUser(res.data);
            setForm({ name: res.data.name, email: res.data.email, phone: res.data.phone });
            setProfilePic(res.data.profilePicUrl || null);
            setError('');
        } catch (err) {
            setError('Failed to fetch profile.');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = () => {
        setEditing(true);
        setPreviewPic(profilePic);
    };

    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handlePicChange = e => {
        const file = e.target.files[0];
        if (file) {
            setPreviewPic(URL.createObjectURL(file));
            setProfilePic(file);
        }
    };

    const handleSave = async () => {
        try {
            setError(''); setSuccess('');
            const formData = new FormData();
            formData.append('name', form.name);
            formData.append('email', form.email);
            formData.append('phone', form.phone);
            if (profilePic && typeof profilePic !== 'string') {
                formData.append('profilePic', profilePic);
            }
            await api.put('/users/me', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            setEditing(false);
            setSuccess('Profile updated successfully!');
            fetchProfile();
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to update profile.';
            setError(errorMessage);
            console.error('Profile update error:', err.response?.data || err.message);
        }
    };

    if (loading) {
        return (
            <div className="profile-page-attractive">
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Loading profile...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="profile-page-attractive">
                <div className="error-message animate-slide-left">{error}</div>
            </div>
        );
    }

    return (
        <div className="profile-page-attractive">
            <div className="profile-header">
                <h1 className="profile-title">My Profile</h1>
                <p className="profile-subtitle">Manage your account information and preferences</p>
            </div>
            
            {error && <div className="error-message animate-slide-left">{error}</div>}
            {success && <div className="success-message animate-slide-left">{success}</div>}
            
            <div className="profile-card-attractive animate-fade-in">
                <div className="profile-pic-section">
                    <div className="profile-pic-container">
                        <img
                            src={previewPic || profilePic || '/default-profile.png'}
                            alt="Profile"
                            className="profile-pic-img"
                        />
                        {editing && (
                            <div className="profile-pic-overlay">
                                <FaCamera className="camera-icon" />
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={handlePicChange}
                                    className="profile-pic-input"
                                    id="profile-pic-input"
                                />
                                <label htmlFor="profile-pic-input" className="profile-pic-label">
                                    Change Photo
                                </label>
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="profile-info-section">
                    <div className="profile-info-item">
                        <FaUser className="profile-info-icon" />
                        <div className="profile-info-content">
                            <span className="profile-info-label">Name</span>
                            {editing ? (
                                <input 
                                    name="name" 
                                    value={form.name} 
                                    onChange={handleChange}
                                    className="profile-input"
                                    placeholder="Enter your name"
                                />
                            ) : (
                                <span className="profile-info-value">{user.name}</span>
                            )}
                        </div>
                    </div>
                    
                    <div className="profile-info-item">
                        <FaEnvelope className="profile-info-icon" />
                        <div className="profile-info-content">
                            <span className="profile-info-label">Email</span>
                            {editing ? (
                                <input 
                                    name="email" 
                                    value={form.email} 
                                    onChange={handleChange}
                                    className="profile-input"
                                    placeholder="Enter your email"
                                />
                            ) : (
                                <span className="profile-info-value">{user.email}</span>
                            )}
                        </div>
                    </div>
                    
                    <div className="profile-info-item">
                        <FaPhone className="profile-info-icon" />
                        <div className="profile-info-content">
                            <span className="profile-info-label">Phone</span>
                            {editing ? (
                                <input 
                                    name="phone" 
                                    value={form.phone} 
                                    onChange={handleChange}
                                    className="profile-input"
                                    placeholder="Enter your phone"
                                />
                            ) : (
                                <span className="profile-info-value">{user.phone}</span>
                            )}
                        </div>
                    </div>
                    
                    <div className="profile-info-item">
                        <FaUserTag className="profile-info-icon" />
                        <div className="profile-info-content">
                            <span className="profile-info-label">Role</span>
                            <span className="profile-info-value profile-role">{user.role}</span>
                        </div>
                    </div>
                </div>
                
                <div className="profile-actions-section">
                    {editing ? (
                        <div className="profile-action-buttons">
                            <button className="btn btn-save" onClick={handleSave}>
                                <FaSave className="btn-icon" />
                                Save Changes
                            </button>
                            <button className="btn btn-cancel" onClick={() => setEditing(false)}>
                                <FaTimes className="btn-icon" />
                                Cancel
                            </button>
                        </div>
                    ) : (
                        <button className="btn btn-edit" onClick={handleEdit}>
                            <FaEdit className="btn-icon" />
                            Edit Profile
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
