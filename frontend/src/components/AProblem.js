import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from './navbar';

const AProblems = () => {
   const API_URL = process.env.REACT_APP_SERVER_API;
  const { user } = useAuth();
  const [problems, setProblems] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [filterTag, setFilterTag] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    const fetchProblems = async () => {
      try {
        const res = await axios.get(`${API_URL}/problems`);
        if (res.data.success) {
          setProblems(res.data.problems);
          setFiltered(res.data.problems);
        }
      } catch (err) {
        setError('Error loading problems');
      }
    };
    fetchProblems();
  }, [user,API_URL]);

  const handleFilterChange = (e) => {
    const value = e.target.value;
    setFilterTag(value);
    const filteredList = problems.filter(q =>
      (q.tag || '').toLowerCase().includes(value.toLowerCase())
    );
    setFiltered(filteredList);
  };

  const handleViewClick = (qid) => navigate(`/adminproblem/${qid}`);

  const handleDelete = async (qid) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete QID: ${qid}?`);
    if (!confirmDelete) return;
    try {
      await axios.delete(`${API_URL}/problem/${qid}`);
      const updated = problems.filter(p => p.QID !== qid);
      setProblems(updated);
      setFiltered(updated);
    } catch (err) {
      alert('Error deleting the question.');
      console.error(err);
    }
  };

  const getDifficultyBadge = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'badge bg-success-subtle border border-success text-success px-3 py-2 rounded-pill';
      case 'medium': return 'badge bg-warning-subtle border border-warning text-warning px-3 py-2 rounded-pill';
      case 'hard': return 'badge bg-danger-subtle border border-danger text-danger px-3 py-2 rounded-pill';
      case 'basic': return 'badge bg-secondary-subtle border border-secondary text-secondary px-3 py-2 rounded-pill';
      default: return 'badge bg-light';
    }
  };

  const getTagBadge = () => 'badge bg-success text-dark px-2 py-1 rounded-pill';

  if (!user) return <div className="alert alert-danger text-center mt-5">Unauthorized</div>;
  if (user.role !== 'admin') return (
    <div className="container mt-5">
      <div className="alert alert-danger text-center">You are not logged in.</div>
    </div>
  );

  return (
    <>
      <Navbar />
      <div className="container my-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
        
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        {/* Tag Filter */}
        <div className="input-group mb-4">
          <input
            type="text"
            className="form-control bg-body text-body border border-secondary-subtle shadow-sm"
            placeholder="🔍 Filter by tag (e.g., array, dp, hash)"
            value={filterTag}
            onChange={handleFilterChange}
          />

          <span className="input-group-text"><i className="bi bi-filter"></i></span>
        </div>

        {/* Problem List */}
        <div className="row">
          {filtered.length === 0 && (
            <div className="col-12">
              <div className="alert alert-warning text-center">No problems match the filter.</div>
            </div>
          )}

          {filtered.map((q, index) => (
            <div key={index} className="col-md-12 mb-3">
              <div className="card shadow-sm border-0">
                <div className="card-body d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="mb-1"
                      style={{
                        background: 'linear-gradient(to right,#f12711, #f5af19)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        fontWeight: '600'
                      }}>{q.name}</h5>
                    <div className="d-flex gap-2 align-items-center flex-wrap">
                      <span className="text-muted small">QID: {q.QID}</span>
                      {q.tag && <span className={getTagBadge(q.tag)}>{q.tag}</span>}
                      <span className={getDifficultyBadge(q.difficulty)}>{q.difficulty?.toUpperCase()}</span>
                    </div>
                  </div>
                  <div className="d-flex gap-2">
                    <button className="btn btn-outline-primary btn-sm" onClick={() => handleViewClick(q.QID)}> View</button>
                    <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(q.QID)}> Delete</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default AProblems;
