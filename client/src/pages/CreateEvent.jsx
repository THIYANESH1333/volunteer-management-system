import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/utils/api.js';
import { FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaPlus, FaTrash, FaArrowLeft } from 'react-icons/fa';
import './Admin.css';

const CreateEvent = () => {
    const [formData, setFormData] = useState({
        title: '', description: '', date: '', time: '', timePeriod: 'AM',
        location: '', contactNumber: '', maxVolunteers: 10,
        locationCoordinates: { latitude: '', longitude: '' }
    });
    const [tasks, setTasks] = useState(['']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
        
        try {
            const payload = {
                ...formData,
                date: formData.date,
                time: convertTo24Hour(formData.time, formData.timePeriod),
                tasks: tasks.filter(t => t.trim() !== ''),
            };
            
            await api.post('/events', payload);
            setSuccess('Event created successfully!');
            
            // Redirect to events page after 2 seconds
            setTimeout(() => {
                navigate('/admin/events');
            }, 2000);
            
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create event.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-page">
            <div className="create-event-container">
                <div className="create-event-header">
                    <button 
                        onClick={() => navigate('/admin/events')} 
                        className="back-button"
                    >
                        <FaArrowLeft size={20} />
                        Back to Events
                    </button>
                    <h1 className="create-event-title">Create New Event</h1>
                    <p className="create-event-subtitle">Fill in the details below to create a new volunteer event</p>
                </div>

                {error && (
                    <div className="error-message create-event-error">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="success-message create-event-success">
                        {success}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="create-event-form">
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
                                <label htmlFor="time"><FaPlus size={16} />Event Time</label>
                                <div className="time-input-group">
                                    <input 
                                        id="time" 
                                        type="text" 
                                        name="time" 
                                        value={formData.time} 
                                        onChange={handleChange} 
                                        placeholder="Enter time (e.g., 2:30)"
                                        required 
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
                            disabled={loading}
                        >
                            {loading ? 'Creating Event...' : 'Create Event'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateEvent; 