import { useState, useEffect } from 'react';
import api from '../utils/api';
import './ReportProblem.css';

const ProblemForm = ({ problem, onSuccess, onCancel }) => {
  const [form, setForm] = useState({ title: '', description: '', location: '' });
  const [photo, setPhoto] = useState(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (problem) {
      setForm({
        title: problem.title || '',
        description: problem.description || '',
        location: problem.location || ''
      });
    }
  }, [problem]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePhoto = e => {
    setPhoto(e.target.files[0]);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSuccess(''); setError(''); setLoading(true);
    const data = new FormData();
    data.append('title', form.title);
    data.append('description', form.description);
    data.append('location', form.location);
    if (photo) data.append('photo', photo);
    try {
      if (problem) {
        await api.put(`/problems/${problem._id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
        setSuccess('Problem updated successfully!');
      } else {
        await api.post('/problems', data, { headers: { 'Content-Type': 'multipart/form-data' } });
        setSuccess('Problem reported successfully!');
        setForm({ title: '', description: '', location: '' });
        setPhoto(null);
      }
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit problem.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="report-problem-form" onSubmit={handleSubmit}>
      {success && <div className="success-message">{success}</div>}
      {error && <div className="error-message">{error}</div>}
      <label>Title</label>
      <input name="title" value={form.title} onChange={handleChange} required />
      <label>Description</label>
      <textarea name="description" value={form.description} onChange={handleChange} required rows={4} />
      <label>Location</label>
      <input name="location" value={form.location} onChange={handleChange} required />
      <label>Photo (optional)</label>
      <input type="file" accept="image/*" onChange={handlePhoto} />
      <button type="submit" className="btn-primary" disabled={loading}>{loading ? (problem ? 'Updating...' : 'Submitting...') : (problem ? 'Update Problem' : 'Submit Problem')}</button>
      {onCancel && <button type="button" className="btn-secondary" onClick={onCancel} style={{marginLeft:8}}>Cancel</button>}
    </form>
  );
};

// Default export: create mode
const ReportProblem = () => (
  <div className="report-problem-page">
    <h2>Report an Environmental Problem</h2>
    <ProblemForm />
  </div>
);

export default ReportProblem;
export { ProblemForm }; 