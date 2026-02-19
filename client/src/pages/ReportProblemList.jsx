import { useEffect, useState } from 'react';
import api from '../utils/api';
import { ProblemForm } from './ReportProblem';
import './ReportProblem.css';

const ReportProblemList = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const res = await api.get('/problems?mine=1');
      setProblems(res.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch your reports.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (problem) => {
    setEditing(problem);
  };

  const handleEditSuccess = () => {
    setEditing(null);
    fetchProblems();
  };

  if (loading) return <div>Loading your reports...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="report-problem-page">
      <h2>Your Reported Problems</h2>
      {editing ? (
        <div>
          <h3>Edit Problem</h3>
          <ProblemForm problem={editing} onSuccess={handleEditSuccess} onCancel={() => setEditing(null)} />
        </div>
      ) : (
        <div className="admin-problems-list">
          {problems.length === 0 ? (
            <p>You have not reported any problems yet.</p>
          ) : (
            problems.map(problem => (
              <div className="admin-problem-card" key={problem._id}>
                <div className="admin-problem-header">
                  <h3>{problem.title}</h3>
                  <span>{new Date(problem.createdAt).toLocaleString()}</span>
                </div>
                <p><strong>Description:</strong> {problem.description}</p>
                <p><strong>Location:</strong> {problem.location}</p>
                {problem.photoUrl && (
                  <img src={problem.photoUrl} alt="Problem" className="admin-problem-img" />
                )}
                <button className="btn-secondary" onClick={() => handleEdit(problem)} style={{marginTop:8}}>Edit</button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ReportProblemList; 