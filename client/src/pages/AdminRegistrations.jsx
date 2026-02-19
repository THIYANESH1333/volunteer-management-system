import { useState, useEffect } from 'react';
import api from '@/utils/api.js';
import './Admin.css';
import { FaUser, FaEnvelope, FaPhone, FaCalendarAlt, FaClipboardList } from 'react-icons/fa';

const AdminRegistrations = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filterDate, setFilterDate] = useState('');
    const [expandedEventId, setExpandedEventId] = useState(null);
    const [volunteers, setVolunteers] = useState({}); // eventId -> volunteers array
    const [volunteersLoading, setVolunteersLoading] = useState({}); // eventId -> loading bool
    const [volunteersError, setVolunteersError] = useState({}); // eventId -> error string

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

    const handleToggleVolunteers = async (eventId) => {
        if (expandedEventId === eventId) {
            setExpandedEventId(null);
            return;
        }
        setExpandedEventId(eventId);
        if (!volunteers[eventId]) {
            setVolunteersLoading(v => ({ ...v, [eventId]: true }));
            setVolunteersError(e => ({ ...e, [eventId]: '' }));
            try {
                const res = await api.get(`/registrations/event/${eventId}`);
                setVolunteers(v => ({ ...v, [eventId]: res.data }));
            } catch (err) {
                setVolunteersError(e => ({ ...e, [eventId]: 'Failed to fetch volunteers.' }));
            } finally {
                setVolunteersLoading(v => ({ ...v, [eventId]: false }));
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

    return (
        <div className="admin-page">
            <h2>All Event Registrations</h2>
            <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
                <input
                    type="date"
                    value={filterDate}
                    onChange={e => setFilterDate(e.target.value)}
                    style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #ccc' }}
                />
            </div>
            <div className="admin-registrations-grid">
                {loading ? (
                    <div>Loading events...</div>
                ) : error ? (
                    <div className="error-message">{error}</div>
                ) : filteredEvents.length > 0 ? (
                    filteredEvents.map(event => (
                        <div className="admin-registration-card" key={event._id}>
                            <div className="admin-registration-header">
                                <span className="admin-registration-event"><FaClipboardList style={{marginRight:6}} />{event.title}</span>
                                <span className="admin-registration-date"><FaCalendarAlt style={{marginRight:6}} />{new Date(event.date).toLocaleDateString()}</span>
                            </div>
                            <button className="btn-secondary" style={{marginTop:12, marginBottom:8}} onClick={() => handleToggleVolunteers(event._id)}>
                                {expandedEventId === event._id ? 'Hide Volunteers' : 'View Volunteers'}
                            </button>
                            {expandedEventId === event._id && (
                                <div className="admin-volunteers-list" style={{marginTop:12}}>
                                    {volunteersLoading[event._id] ? (
                                        <div>Loading volunteers...</div>
                                    ) : volunteersError[event._id] ? (
                                        <div className="error-message">{volunteersError[event._id]}</div>
                                    ) : volunteers[event._id] && volunteers[event._id].length > 0 ? (
                                        volunteers[event._id].map(reg => (
                                            <div className="admin-volunteer-item" key={reg._id} style={{marginBottom:10, background:'rgba(255,255,255,0.07)', borderRadius:10, padding:'10px 14px', display:'flex', alignItems:'center', gap:18}}>
                                                <span><FaUser style={{marginRight:6}} />{reg.volunteer?.name || 'N/A'}</span>
                                                <span><FaEnvelope style={{marginRight:6}} />{reg.volunteer?.email || 'N/A'}</span>
                                                <span><FaPhone style={{marginRight:6}} />{reg.volunteer?.phone || 'N/A'}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <div style={{color:'#fff'}}>No volunteers registered for this event.</div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <p style={{ textAlign: 'center', marginTop: 32 }}>No events found.</p>
                )}
            </div>
        </div>
    );
};

export default AdminRegistrations;
