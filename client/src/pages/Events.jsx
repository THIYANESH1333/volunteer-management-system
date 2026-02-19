/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import EventCard from '../components/EventCard';
import '../styles/pages.css';

const Events = () => {
    const { user } = useAuth();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [registeredEvents, setRegisteredEvents] = useState([]);

    useEffect(() => {
        fetchEvents();
        if (user) fetchRegistrations();
        // eslint-disable-next-line
    }, [user]);

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

    const fetchRegistrations = async () => {
        try {
            const res = await api.get('/registrations');
            console.log('Fetched registrations:', res.data);
            const registeredEventIds = res.data.map(r => {
                // Handle both populated and unpopulated event references
                const eventId = r.event._id || r.event;
                console.log('Registration event ID:', eventId);
                return eventId;
            });
            console.log('Registered event IDs:', registeredEventIds);
            setRegisteredEvents(registeredEventIds);
        } catch (err) {
            console.error('Error fetching registrations:', err);
            setRegisteredEvents([]);
        }
    };

    const handleRegister = async (eventId) => {
        setError(''); setSuccess('');
        try {
            await api.post(`/registrations/${eventId}`);
            setSuccess('Registered successfully!');
            fetchRegistrations();
            fetchEvents();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to register.');
        }
    };

    const handleUnregister = async (eventId) => {
        setError(''); setSuccess('');
        try {
            console.log('Attempting to unregister from event:', eventId);
            console.log('Current registered events:', registeredEvents);
            console.log('Is user registered for this event:', registeredEvents.includes(eventId));
            
            await api.delete(`/registrations/${eventId}`);
            console.log('Unregister successful');
            setSuccess('Unregistered successfully!');
            fetchRegistrations();
            fetchEvents();
        } catch (err) {
            console.error('Unregister error:', err);
            console.error('Error response:', err.response);
            setError(err.response?.data?.message || 'Failed to unregister.');
        }
    };

    if (loading) {
        return (
            <div className="events-page">
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Loading events...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="events-page">
            <div className="events-header">
                <h1 className="events-title">Upcoming Events</h1>
                <p className="events-subtitle">Discover and join volunteer opportunities in your community</p>
            </div>
            
            {error && <div className="error-message animate-slide-left">{error}</div>}
            {success && <div className="success-message animate-slide-left">{success}</div>}
            
            <div className="events-list">
                {events.length > 0 ? (
                    events.map((event, index) => {
                        const isRegistered = registeredEvents.includes(event._id);
                        
                        return (
                            <EventCard
                                key={event._id}
                                event={event}
                                isRegistered={isRegistered}
                                onRegister={() => handleRegister(event._id)}
                                onUnregister={() => handleUnregister(event._id)}
                            />
                        );
                    })
                ) : (
                    <div className="no-events">
                        <p>No events found.</p>
                        <p>Check back later for new volunteer opportunities!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Events; 