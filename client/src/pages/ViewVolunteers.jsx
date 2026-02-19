import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '@/utils/api.js';
import { FaArrowLeft, FaUserCircle, FaEnvelope, FaPhone, FaCalendarAlt, FaUsers } from 'react-icons/fa';
import './Admin.css';

const ViewVolunteers = () => {
    const [volunteers, setVolunteers] = useState([]);
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { eventId } = useParams();

    useEffect(() => {
        fetchEventAndVolunteers();
    }, [eventId]);

    const fetchEventAndVolunteers = async () => {
        try {
            setLoading(true);
            setError('');
            
            // Fetch event details
            const eventRes = await api.get(`/events/${eventId}`);
            setEvent(eventRes.data);
            
            // Fetch volunteers for this event
            const volunteersRes = await api.get(`/registrations/event/${eventId}`);
            setVolunteers(volunteersRes.data);
            
        } catch (err) {
            setError('Failed to fetch event details or volunteers.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="admin-page">
                <div className="volunteers-loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading volunteers...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="admin-page">
                <div className="volunteers-error-container">
                    <h2>Error</h2>
                    <p>{error}</p>
                    <button onClick={() => navigate('/admin/events')} className="back-button">
                        <FaArrowLeft size={20} />
                        Back to Events
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-page">
            <div className="volunteers-container">
                <div className="volunteers-header">
                    <button 
                        onClick={() => navigate('/admin/events')} 
                        className="back-button"
                    >
                        <FaArrowLeft size={20} />
                        Back to Events
                    </button>
                    
                    {event && (
                        <div className="event-info-card">
                            <h1 className="volunteers-title">
                                <FaUsers size={32} style={{ marginRight: 12, color: '#ffd700' }} />
                                Volunteers for "{event.title}"
                            </h1>
                            <div className="event-details-summary">
                                <div className="event-detail-item">
                                    <FaCalendarAlt size={16} />
                                    <span>{new Date(event.date).toLocaleDateString()}</span>
                                </div>
                                <div className="event-detail-item">
                                    <FaUsers size={16} />
                                    <span>{volunteers.length} / {event.maxVolunteers} volunteers</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="volunteers-content">
                    {volunteers.length === 0 ? (
                        <div className="no-volunteers">
                            <FaUsers size={64} style={{ color: '#b3c6f7', marginBottom: 16 }} />
                            <h3>No Volunteers Yet</h3>
                            <p>No volunteers have registered for this event yet.</p>
                        </div>
                    ) : (
                        <div className="volunteers-table-container">
                            <div className="volunteers-table-header">
                                <h3>Registered Volunteers ({volunteers.length})</h3>
                            </div>
                            <div className="volunteers-table-wrapper">
                                <table className="volunteers-table">
                                    <thead>
                                        <tr>
                                            <th>Volunteer</th>
                                            <th>Email</th>
                                            <th>Phone</th>
                                            <th>Status</th>
                                            <th>Registered At</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {volunteers.map((volunteer, index) => (
                                            <tr key={volunteer._id} className="volunteer-row">
                                                <td className="volunteer-name-cell">
                                                    <div className="volunteer-info">
                                                        {volunteer.volunteer?.profilePicUrl ? (
                                                            <img 
                                                                src={volunteer.volunteer.profilePicUrl} 
                                                                alt="Profile" 
                                                                className="volunteer-avatar" 
                                                            />
                                                        ) : volunteer.volunteer?.name ? (
                                                            <div className="volunteer-avatar-placeholder">
                                                                {volunteer.volunteer.name[0].toUpperCase()}
                                                            </div>
                                                        ) : (
                                                            <FaUserCircle size={32} className="volunteer-avatar-icon" />
                                                        )}
                                                        <span className="volunteer-name">
                                                            {volunteer.volunteer?.name || 'N/A'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="volunteer-email">
                                                    <FaEnvelope size={14} style={{ marginRight: 8, color: '#ffd700' }} />
                                                    {volunteer.volunteer?.email || 'N/A'}
                                                </td>
                                                <td className="volunteer-phone">
                                                    <FaPhone size={14} style={{ marginRight: 8, color: '#ffd700' }} />
                                                    {volunteer.volunteer?.phone || 'N/A'}
                                                </td>
                                                <td className="volunteer-status">
                                                    <span className="status-badge status-registered">
                                                        {volunteer.status || 'registered'}
                                                    </span>
                                                </td>
                                                <td className="volunteer-date">
                                                    {volunteer.registeredAt ? 
                                                        new Date(volunteer.registeredAt).toLocaleString() : 
                                                        'N/A'
                                                    }
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ViewVolunteers; 