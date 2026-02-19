import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '@/utils/api.js';
import { FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaPlus, FaTrash, FaArrowLeft, FaEdit } from 'react-icons/fa';
import './Admin.css';

const EditEvent = () => {
    const [formData, setFormData] = useState({
        title: '', description: '', date: '', time: '', timePeriod: 'AM',
        location: '', contactNumber: '', maxVolunteers: 10,
        locationCoordinates: { latitude: '', longitude: '' }
    });
    const [tasks, setTasks] = useState(['']);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();
    const { eventId } = useParams();

    useEffect(() => {
        fetchEvent();
    }, [eventId]);

    // Function to convert AM/PM time to 24-hour format
    const convertTo24Hour = (time, period) => {
        if (!time || time === '') return '';
        
        try {
            const [hours, minutes] = time.split(':');
            let hour = parseInt(hours);
            const minute = parseInt(minutes);
            
            if (isNaN(hour) || isNaN(minute)) return '';
            
            if (period === 'PM' && hour !== 12) {
                hour += 12;
            } else if (period === 'AM' && hour === 12) {
                hour = 0;
            }
            
            return `${hour.toString().padStart(2, '0')}:${minutes}`;
        } catch (error) {
            return '';
        }
    };

    // Function to convert 24-hour format to 12-hour format for display
    const convertTo12Hour = (time24) => {
        if (!time24 || time24 === '') return { time: '', period: 'AM' };
        
        try {
            const [hours, minutes] = time24.split(':');
            const hour = parseInt(hours);
            
            if (hour === 0) {
                return { time: '12:00', period: 'AM' };
            } else if (hour === 12) {
                return { time: '12:00', period: 'PM' };
            } else if (hour > 12) {
                return { time: `${hour - 12}:${minutes}`, period: 'PM' };
            } else {
                return { time: `${hour}:${minutes}`, period: 'AM' };
            }
        } catch (error) {
            // If parsing fails, return empty
            return { time: '', period: 'AM' };
        }
    };

    const fetchEvent = async () => {
        try {
            setLoading(true);
            setError('');
            
            const res = await api.get(`/events/${eventId}`);
            const event = res.data;
            
            const time12Hour = convertTo12Hour(event.time);
            
            setFormData({
                title: event.title,
                description: event.description,
                date: new Date(event.date).toISOString().split('T')[0],
                time: time12Hour.time,
                timePeriod: time12Hour.period,
                location: event.location,
                contactNumber: event.contactNumber,
                maxVolunteers: event.maxVolunteers,
                locationCoordinates: event.locationCoordinates || { latitude: '', longitude: '' }
            });
            
            setTasks(event.tasks && event.tasks.length > 0 ? event.tasks : ['']);
            
        } catch (err) {
            setError('Failed to fetch event details.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleTaskChange = (idx, value) => {
        const newTasks = [...tasks];
        newTasks[idx] = value;
        setTasks(newTasks);
    };

    const addTask = () => setTasks([...tasks, '']);
    const removeTask = (idx) => setTasks(tasks.filter((_, i) => i !== idx));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');
        
        try {
            const payload = {
                ...formData,
                date: formData.date,
                time: convertTo24Hour(formData.time, formData.timePeriod),
                tasks: tasks.filter(t => t.trim() !== ''),
            };
            
            await api.put(`/events/${eventId}`, payload);
            setSuccess('Event updated successfully!');
            
            // Redirect to events page after 2 seconds
            setTimeout(() => {
                navigate('/admin/events');
            }, 2000);
            
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update event.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="admin-page">
                <div className="edit-event-loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading event details...</p>
                </div>
            </div>
        );
    }

    if (error && !formData.title) {
        return (
            <div className="admin-page">
                <div className="edit-event-error-container">
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
            <div className="edit-event-container">
                <div className="edit-event-header">
                    <button 
                        onClick={() => navigate('/admin/events')} 
                        className="back-button"
                    >
                        <FaArrowLeft size={20} />
                        Back to Events
                    </button>
                    <h1 className="edit-event-title">
                        <FaEdit size={32} style={{ marginRight: 12, color: '#ffd700' }} />
                        Edit Event
                    </h1>
                    <p className="edit-event-subtitle">Update the event details below</p>
                </div>

                {error && (
                    <div className="error-message edit-event-error">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="success-message edit-event-success">
                        {success}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="edit-event-form">
                    <div className="form-section">
                        <h3 className="form-section-title">Event Details</h3>
                        
                        <div className="form-group">
                            <label htmlFor="title">
                                <FaPlus size={16} />
                                Event Title
                            </label>
                            <input
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Enter event title"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="description">
                                <FaPlus size={16} />
                                Description
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Describe the event and what volunteers will do"
                                rows={4}
                                required
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="date">
                                    <FaCalendarAlt size={16} />
                                    Event Date
                                </label>
                                <input
                                    id="date"
                                    type="date"
                                    name="date"
                                    value={formData.date}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="time">
                                    <FaPlus size={16} />
                                    Event Time
                                </label>
                                <div className="time-input-group">
                                    <input
                                        id="time"
                                        type="text"
                                        name="time"
                                        value={formData.time || ''}
                                        onChange={handleChange}
                                        placeholder="Enter time (e.g., 2:30)"
                                    />
                                    <select 
                                        name="timePeriod" 
                                        value={formData.timePeriod || 'AM'} 
                                        onChange={handleChange}
                                        className="time-period-select"
                                    >
                                        <option value="AM">AM</option>
                                        <option value="PM">PM</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="maxVolunteers">
                                    <FaUsers size={16} />
                                    Max Volunteers
                                </label>
                                <input
                                    id="maxVolunteers"
                                    type="number"
                                    name="maxVolunteers"
                                    value={formData.maxVolunteers}
                                    onChange={handleChange}
                                    min="1"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="location">
                                <FaMapMarkerAlt size={16} />
                                Location
                            </label>
                            <input
                                id="location"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                placeholder="Enter event location"
                                required
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="latitude">
                                    <FaMapMarkerAlt size={16} />
                                    Latitude
                                </label>
                                <input
                                    id="latitude"
                                    type="number"
                                    step="any"
                                    name="locationCoordinates.latitude"
                                    value={formData.locationCoordinates.latitude}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        locationCoordinates: {
                                            ...prev.locationCoordinates,
                                            latitude: e.target.value
                                        }
                                    }))}
                                    placeholder="Enter latitude (e.g., 13.0827)"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="longitude">
                                    <FaMapMarkerAlt size={16} />
                                    Longitude
                                </label>
                                <input
                                    id="longitude"
                                    type="number"
                                    step="any"
                                    name="locationCoordinates.longitude"
                                    value={formData.locationCoordinates.longitude}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        locationCoordinates: {
                                            ...prev.locationCoordinates,
                                            longitude: e.target.value
                                        }
                                    }))}
                                    placeholder="Enter longitude (e.g., 80.2707)"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="contactNumber">
                                <FaUsers size={16} />
                                Contact Number
                            </label>
                            <input
                                id="contactNumber"
                                name="contactNumber"
                                value={formData.contactNumber}
                                onChange={handleChange}
                                placeholder="Enter contact number for the event"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-section">
                        <h3 className="form-section-title">Event Tasks</h3>
                        <p className="form-section-subtitle">List the specific tasks volunteers will perform</p>
                        
                        {tasks.map((task, idx) => (
                            <div key={idx} className="task-input-group">
                                <input
                                    value={task}
                                    onChange={e => handleTaskChange(idx, e.target.value)}
                                    placeholder={`Task ${idx + 1}`}
                                    className="task-input"
                                />
                                {tasks.length > 1 && (
                                    <button 
                                        type="button" 
                                        onClick={() => removeTask(idx)} 
                                        className="remove-task-btn"
                                    >
                                        <FaTrash size={14} />
                                    </button>
                                )}
                            </div>
                        ))}
                        
                        <button 
                            type="button" 
                            onClick={addTask} 
                            className="add-task-btn"
                        >
                            <FaPlus size={16} />
                            Add Task
                        </button>
                    </div>

                    <div className="form-actions">
                        <button 
                            type="button" 
                            onClick={() => navigate('/admin/events')} 
                            className="cancel-btn"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="submit-btn"
                            disabled={saving}
                        >
                            {saving ? 'Updating Event...' : 'Update Event'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditEvent; 