import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/utils/api.js';
import Modal from '@/components/Modal';
import './Admin.css';
import { FaCalendarAlt, FaMapMarkerAlt, FaUserCircle } from 'react-icons/fa';

const AdminEvents = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentEvent, setCurrentEvent] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        location: '',
        maxVolunteers: 10,
    });
    const [tasks, setTasks] = useState(['']);
    const [filterDate, setFilterDate] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const res = await api.get('/events');
            setEvents(res.data);
            setError('');
        } catch (err) {
            setError('Failed to fetch events.');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (event = null) => {
        setCurrentEvent(event);
        if (event) {
            setFormData({
                title: event.title,
                description: event.description,
                date: new Date(event.date).toISOString().split('T')[0], // Format for date input
                location: event.location,
                maxVolunteers: event.maxVolunteers,
            });
            setTasks(event.tasks && event.tasks.length > 0 ? event.tasks : ['']);
        } else {
            setFormData({ title: '', description: '', date: '', location: '', maxVolunteers: 10 });
            setTasks(['']);
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentEvent(null);
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
        try {
            const payload = {
                ...formData,
                date: formData.date, // use as-is from input type="date"
                tasks: tasks.filter(t => t.trim() !== ''),
            };
            if (currentEvent) {
                await api.put(`/events/${currentEvent._id}`, payload);
            } else {
                await api.post('/events', payload);
            }
            fetchEvents();
            handleCloseModal();
        } catch (err) {
            alert(`Failed to ${currentEvent ? 'update' : 'create'} event.`);
            console.error(err);
        }
    };
    const deleteEvent = async (eventId) => {
        if (window.confirm('Are you sure you want to delete this event?')) {
            try {
                await api.delete(`/events/${eventId}`);
                fetchEvents();
            } catch (err) {
                alert('Failed to delete event.');
                console.error(err);
            }
        }
    };

    // Filter events by date
    const filteredEvents = filterDate
        ? events.filter(event => {
            const eventDate = new Date(event.date);
            const selected = new Date(filterDate);
            return (
                eventDate.getFullYear() === selected.getFullYear() &&
                eventDate.getMonth() === selected.getMonth() &&
                eventDate.getDate() === selected.getDate()
            );
        })
        : events;

    if (loading) return <div>Loading events...</div>;
    if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="admin-page">
            <div className="admin-header" style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:16}}>
                <h2>Manage Events</h2>
                <div style={{display:'flex',alignItems:'center',gap:16}}>
                  <input
                    type="date"
                    value={filterDate}
                    onChange={e => setFilterDate(e.target.value)}
                    style={{padding:'6px 10px', borderRadius:6, border:'1px solid #ccc'}}
                  />
                  <button onClick={() => navigate('/admin/create-event')} className="btn-primary">Create Event</button>
                </div>
            </div>
            <div className="admin-events-grid">
              {filteredEvents.length === 0 ? (
                <p style={{textAlign:'center',marginTop:32}}>No events found.</p>
              ) : (
                filteredEvents.map(event => (
                  <div className="admin-event-card" key={event._id}>
                    <div className="admin-event-header">
                      <h3>{event.title}</h3>
                      <span className="admin-event-date"><FaCalendarAlt style={{marginRight:6}} />{new Date(event.date).toLocaleDateString()}</span>
                    </div>
                    <p>{event.description}</p>
                    <div className="admin-event-details">
                      <span><FaMapMarkerAlt style={{marginRight:6}} />{event.location}</span>
                      <span>Max: {event.maxVolunteers}</span>
                    </div>
                    <div className="admin-event-actions">
                      <button onClick={() => navigate(`/admin/edit-event/${event._id}`)} className="btn-secondary">Edit</button>
                      <button onClick={() => deleteEvent(event._id)} className="btn-danger">Delete</button>
                      <button onClick={() => navigate(`/admin/view-volunteers/${event._id}`)} className="btn-primary">View Volunteers</button>
                    </div>
                  </div>
                ))
              )}
            </div>
    </div>
  );
};

export default AdminEvents;
