import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { FaCalendarAlt, FaTrash, FaEdit, FaPlus, FaFilter, FaEye } from 'react-icons/fa';
import './Admin.css';

const AdminProblems = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const res = await api.get('/problems');
      setProblems(res.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch problems.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (problemId) => {
    if (window.confirm('Are you sure you want to delete this problem?')) {
      try {
        await api.delete(`/problems/${problemId}`);
        setSuccess('Problem deleted successfully!');
        fetchProblems();
      } catch (err) {
        setError('Failed to delete problem.');
      }
    }
  };

  const handleEdit = (problem) => {
    setSelectedProblem(problem);
    setIsEditModalOpen(true);
  };

  const handleUpdateProblem = async (updatedData) => {
    try {
      await api.put(`/problems/${selectedProblem._id}`, updatedData);
      setSuccess('Problem updated successfully!');
      setIsEditModalOpen(false);
      setSelectedProblem(null);
      fetchProblems();
    } catch (err) {
      setError('Failed to update problem.');
    }
  };

  const handleConvertToEvent = (problem) => {
    setSelectedProblem(problem);
    setIsConvertModalOpen(true);
  };

  const handleCreateEvent = async (eventData) => {
    try {
      console.log('Creating event from problem:', eventData);
      console.log('Selected problem:', selectedProblem);
      
      // Create event from problem
      const eventPayload = {
        title: eventData.title,
        description: eventData.description,
        date: eventData.date,
        time: convertTo24Hour(eventData.time, eventData.timePeriod),
        location: eventData.location,
        contactNumber: eventData.contactNumber,
        maxVolunteers: eventData.maxVolunteers,
        tasks: eventData.tasks.filter(task => task.trim() !== ''),
        // Mark the problem as converted
        convertedFromProblem: selectedProblem._id
      };

      console.log('Event payload:', eventPayload);

      const eventResponse = await api.post('/events', eventPayload);
      console.log('Event created successfully:', eventResponse.data);
      
      // Delete the original problem
      console.log('Deleting original problem:', selectedProblem._id);
      await api.delete(`/problems/${selectedProblem._id}`);
      console.log('Problem deleted successfully');
      
      setSuccess('Problem converted to event successfully!');
      setIsConvertModalOpen(false);
      setSelectedProblem(null);
      fetchProblems();
      
      // Navigate to events page
      setTimeout(() => {
        navigate('/admin/events');
      }, 2000);
    } catch (err) {
      console.error('Error converting problem to event:', err);
      console.error('Error response:', err.response);
      console.error('Error message:', err.message);
      
      const errorMessage = err.response?.data?.message || 
                         err.response?.data?.msg || 
                         err.message || 
                         'Failed to convert problem to event.';
      
      setError(errorMessage);
    }
  };

  // Filter problems by date
  const filteredProblems = filterDate 
    ? problems.filter(problem => {
        const problemDate = new Date(problem.createdAt);
        const selectedDate = new Date(filterDate);
        return (
          problemDate.getFullYear() === selectedDate.getFullYear() &&
          problemDate.getMonth() === selectedDate.getMonth() &&
          problemDate.getDate() === selectedDate.getDate()
        );
      })
    : problems;

  if (loading) return <div>Loading reported problems...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="admin-page">
      <div className="admin-problems-header">
        <h2>Reported Environmental Problems</h2>
        <div className="admin-problems-filters">
          <div className="filter-group">
            <FaFilter size={16} />
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              placeholder="Filter by date"
              className="date-filter"
            />
            {filterDate && (
              <button 
                onClick={() => setFilterDate('')} 
                className="clear-filter-btn"
              >
                Clear Filter
              </button>
            )}
          </div>
        </div>
      </div>

      {success && (
        <div className="success-message admin-problems-success">
          {success}
        </div>
      )}

      <div className="admin-problems-list">
        {filteredProblems.length === 0 ? (
          <div className="no-problems">
            <FaEye size={48} />
            <h3>No Problems Found</h3>
            <p>{filterDate ? 'No problems reported on the selected date.' : 'No problems reported yet.'}</p>
          </div>
        ) : (
          filteredProblems.map(problem => (
            <div className="admin-problem-card" key={problem._id}>
              <div className="admin-problem-header">
                <h3>{problem.title}</h3>
                <span className="problem-date">
                  <FaCalendarAlt size={14} />
                  {new Date(problem.createdAt).toLocaleString()}
                </span>
              </div>
              
              <div className="problem-content">
                <p><strong>Description:</strong> {problem.description}</p>
                <p><strong>Location:</strong> {problem.location}</p>
                
                {problem.photoUrl && (
                  <div className="problem-image-container">
                    <img src={problem.photoUrl} alt="Problem" className="admin-problem-img" />
                  </div>
                )}
                
                <div className="admin-problem-volunteer">
                  <strong>Reported by:</strong> {problem.volunteer?.name} ({problem.volunteer?.email}, {problem.volunteer?.phone})
                </div>
              </div>

              <div className="problem-actions">
                <button 
                  onClick={() => handleEdit(problem)}
                  className="btn btn-edit"
                >
                  <FaEdit size={14} />
                  Edit
                </button>
                <button 
                  onClick={() => handleConvertToEvent(problem)}
                  className="btn btn-convert"
                >
                  <FaPlus size={14} />
                  Convert to Event
                </button>
                <button 
                  onClick={() => handleDelete(problem._id)}
                  className="btn btn-delete"
                >
                  <FaTrash size={14} />
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit Problem Modal */}
      {isEditModalOpen && selectedProblem && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Edit Problem</h3>
            <EditProblemForm 
              problem={selectedProblem}
              onSubmit={handleUpdateProblem}
              onCancel={() => {
                setIsEditModalOpen(false);
                setSelectedProblem(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Convert to Event Modal */}
      {isConvertModalOpen && selectedProblem && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Convert Problem to Event</h3>
            <ConvertToEventForm 
              problem={selectedProblem}
              onSubmit={handleCreateEvent}
              onCancel={() => {
                setIsConvertModalOpen(false);
                setSelectedProblem(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Edit Problem Form Component
const EditProblemForm = ({ problem, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: problem.title,
    description: problem.description,
    location: problem.location
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="edit-problem-form">
      <div className="form-group">
        <label>Title:</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
          required
        />
      </div>
      
      <div className="form-group">
        <label>Description:</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          required
          rows={4}
        />
      </div>
      
      <div className="form-group">
        <label>Location:</label>
        <input
          type="text"
          value={formData.location}
          onChange={(e) => setFormData({...formData, location: e.target.value})}
          required
        />
      </div>
      
      <div className="form-actions">
        <button type="button" onClick={onCancel} className="btn btn-cancel">
          Cancel
        </button>
        <button type="submit" className="btn btn-save">
          Save Changes
        </button>
      </div>
    </form>
  );
};

// Convert to Event Form Component
const ConvertToEventForm = ({ problem, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: `Clean ${problem.location}`,
    description: `Volunteer event to address: ${problem.description}`,
    date: '',
    time: '',
    timePeriod: 'AM',
    location: problem.location,
    contactNumber: '',
    maxVolunteers: 10,
    locationCoordinates: { latitude: '', longitude: '' },
    tasks: ['Remove waste and debris', 'Clean the area', 'Plant trees if applicable']
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleTaskChange = (index, value) => {
    const newTasks = [...formData.tasks];
    newTasks[index] = value;
    setFormData({...formData, tasks: newTasks});
  };

  const addTask = () => {
    setFormData({
      ...formData, 
      tasks: [...formData.tasks, '']
    });
  };

  const removeTask = (index) => {
    const newTasks = formData.tasks.filter((_, i) => i !== index);
    setFormData({...formData, tasks: newTasks});
  };

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

  return (
    <form onSubmit={handleSubmit} className="convert-to-event-form">
      <div className="form-group">
        <label>Event Title:</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
          required
        />
      </div>
      
      <div className="form-group">
        <label>Description:</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          required
          rows={4}
        />
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label>Event Date:</label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({...formData, date: e.target.value})}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Event Time:</label>
          <div className="time-input-group">
            <input
              type="text"
              value={formData.time}
              onChange={(e) => setFormData({...formData, time: e.target.value})}
              placeholder="Enter time (e.g., 2:30)"
              required
            />
            <select 
              name="timePeriod" 
              value={formData.timePeriod || 'AM'} 
              onChange={(e) => setFormData({...formData, timePeriod: e.target.value})}
              className="time-period-select"
            >
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label>Max Volunteers:</label>
          <input
            type="number"
            value={formData.maxVolunteers}
            onChange={(e) => setFormData({...formData, maxVolunteers: parseInt(e.target.value)})}
            min="1"
            required
          />
        </div>
      </div>
      
      <div className="form-group">
        <label>Location:</label>
        <input
          type="text"
          value={formData.location}
          onChange={(e) => setFormData({...formData, location: e.target.value})}
          required
        />
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label>Latitude:</label>
          <input
            type="number"
            step="any"
            value={formData.locationCoordinates.latitude}
            onChange={(e) => setFormData({
              ...formData,
              locationCoordinates: {
                ...formData.locationCoordinates,
                latitude: e.target.value
              }
            })}
            placeholder="Enter latitude (e.g., 13.0827)"
          />
        </div>
        
        <div className="form-group">
          <label>Longitude:</label>
          <input
            type="number"
            step="any"
            value={formData.locationCoordinates.longitude}
            onChange={(e) => setFormData({
              ...formData,
              locationCoordinates: {
                ...formData.locationCoordinates,
                longitude: e.target.value
              }
            })}
            placeholder="Enter longitude (e.g., 80.2707)"
          />
        </div>
      </div>
      
      <div className="form-group">
        <label>Contact Number:</label>
        <input
          type="text"
          value={formData.contactNumber}
          onChange={(e) => setFormData({...formData, contactNumber: e.target.value})}
          placeholder="Enter contact number for the event"
          required
        />
      </div>
      
      <div className="form-group">
        <label>Tasks:</label>
        {formData.tasks.map((task, index) => (
          <div key={index} className="task-input-group">
            <input
              type="text"
              value={task}
              onChange={(e) => handleTaskChange(index, e.target.value)}
              placeholder={`Task ${index + 1}`}
            />
            {formData.tasks.length > 1 && (
              <button 
                type="button" 
                onClick={() => removeTask(index)}
                className="remove-task-btn"
              >
                <FaTrash size={12} />
              </button>
            )}
          </div>
        ))}
        <button type="button" onClick={addTask} className="add-task-btn">
          <FaPlus size={14} />
          Add Task
        </button>
      </div>
      
      <div className="form-actions">
        <button type="button" onClick={onCancel} className="btn btn-cancel">
          Cancel
        </button>
        <button type="submit" className="btn btn-convert">
          <FaPlus size={14} />
          Create Event
        </button>
      </div>
    </form>
  );
};

export default AdminProblems; 