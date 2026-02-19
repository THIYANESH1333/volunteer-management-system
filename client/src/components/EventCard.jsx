/* eslint-disable react/prop-types */
import { useAuth } from '../context/AuthContext';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaUsers, FaCheckCircle, FaTimesCircle, FaPhone, FaMap } from 'react-icons/fa';
import '../styles/components.css';

const EventCard = ({ event, onRegister, onUnregister, isRegistered }) => {
  const { user } = useAuth();

  const handleRegister = async () => {
    try {
      await onRegister();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to register');
    }
  };

  const handleUnregister = async () => {
    try {
      await onUnregister();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to unregister');
    }
  };

  // Function to determine event status based on date
  const getEventStatus = (eventDate) => {
    const today = new Date();
    
    // Handle different date formats
    let eventDateObj;
    if (typeof eventDate === 'string') {
      // Try different date formats
      if (eventDate.includes('/')) {
        // Format: DD/MM/YYYY (European format)
        const [day, month, year] = eventDate.split('/');
        eventDateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      } else if (eventDate.includes('-')) {
        // Format: YYYY-MM-DD
        eventDateObj = new Date(eventDate);
      } else {
        // Try direct parsing
        eventDateObj = new Date(eventDate);
      }
    } else {
      eventDateObj = new Date(eventDate);
    }
    
    // Simple comparison - if dates are the same, it's TODAY
    if (today.toDateString() === eventDateObj.toDateString()) {
      return 'TODAY';
    } else if (eventDateObj > today) {
      return 'UPCOMING';
    } else {
      return 'PAST';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'today':
        return 'status-today';
      case 'tomorrow':
        return 'status-tomorrow';
      case 'upcoming':
        return 'status-upcoming';
      case 'ongoing':
        return 'status-ongoing';
      case 'completed':
        return 'status-completed';
      case 'past':
        return 'status-past';
      default:
        return 'status-default';
    }
  };

  // Function to format time with AM/PM
  const formatTime = (timeString) => {
    if (!timeString) return { time: '', period: '' };
    
    try {
      // Parse the time string (HH:MM format)
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours);
      const minute = parseInt(minutes);
      
      // Convert to 12-hour format
      const period = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      const displayMinute = minute.toString().padStart(2, '0');
      
      return {
        time: `${displayHour}:${displayMinute}`,
        period: period
      };
    } catch (error) {
      // If parsing fails, return original string
      return { time: timeString, period: '' };
    }
  };

  // Function to generate Google Maps URL
  const getMapUrl = (coordinates) => {
    if (!coordinates || !coordinates.latitude || !coordinates.longitude) return null;
    return `https://www.google.com/maps?q=${coordinates.latitude},${coordinates.longitude}`;
  };

  const isFull = event.currentVolunteers >= event.maxVolunteers;
  const eventStatus = getEventStatus(event.date);
  const mapUrl = getMapUrl(event.locationCoordinates);

  return (
    <div className={`event-card ${isRegistered ? 'event-card-registered' : ''} animate-fade-in`}>
      <div className="event-header">
        <h3 className="event-title">{event.title}</h3>
        <span className={`event-status ${getStatusColor(eventStatus)}`}>
          {eventStatus}
        </span>
      </div>
      
      <p className="event-description">{event.description}</p>
      
      <div className="event-details">
        <div className="event-info">
          <div className="event-info-item">
            <FaCalendarAlt size={16} />
            <span>{new Date(event.date).toLocaleDateString()}</span>
          </div>
          {event.time && (
            <div className="event-info-item">
              <FaClock size={16} />
              <span className="time-display">
                {formatTime(event.time).time}
                {formatTime(event.time).period && (
                  <span className="time-period">{formatTime(event.time).period}</span>
                )}
              </span>
            </div>
          )}
          <div className="event-info-item">
            <FaMapMarkerAlt size={16} />
            <span>{event.location}</span>
          </div>
          {event.contactNumber && (
            <div className="event-info-item">
              <FaPhone size={16} />
              <span>Contact: {event.contactNumber}</span>
            </div>
          )}
          {mapUrl && (
            <div className="event-info-item">
              <FaMap size={16} />
              <a 
                href={mapUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="map-link"
              >
                View on Map
              </a>
            </div>
          )}
        </div>
        
        <div className="event-volunteers">
          <FaUsers size={16} />
          <span>{event.currentVolunteers || 0}/{event.maxVolunteers || 'N/A'} volunteers</span>
          {isFull && <span className="event-full-badge">Full</span>}
        </div>
      </div>
      
      {user && user.role === 'volunteer' && (
        <div className="event-actions">
          {isRegistered ? (
            <button 
              onClick={handleUnregister} 
              className="btn btn-unregister animate-pulse"
            >
              <FaTimesCircle size={16} />
              <span>Unregister</span>
            </button>
          ) : (
            <button 
              onClick={handleRegister}
              className={`btn ${isFull ? 'btn-disabled' : 'btn-register'}`}
              disabled={isFull}
            >
              {isFull ? (
                <>
                  <FaTimesCircle size={16} />
                  <span>Event Full</span>
                </>
              ) : (
                <>
                  <FaCheckCircle size={16} />
                  <span>Register</span>
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default EventCard; 