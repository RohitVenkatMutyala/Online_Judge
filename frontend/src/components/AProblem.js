import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from './navbar';
 const AProblems = () => {
  const { user } = useAuth();
  const [problems, setProblems] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [filterTag, setFilterTag] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
if (user.role !== 'admin') return;

    const fetchProblems = async () => {
      try {
        const res = await axios.get('http://localhost:5000/problems');
        if (res.data.success) {
          setProblems(res.data.problems);
          setFiltered(res.data.problems);
        }
      } catch (err) {
        setError('Error loading problems');
      }
    };

    fetchProblems();
  }, [user]);

  const handleFilterChange = (e) => {
    const value = e.target.value;
    setFilterTag(value);

    const filteredList = problems.filter(q =>
      (q.tag || '').toLowerCase().includes(value.toLowerCase())
    );

    setFiltered(filteredList);
  };

  const handleViewClick = (qid) => {
    navigate(`/adminproblem/${qid}`);
  };

  const handleDelete = async (qid) => {
    const confirm = window.confirm(`Are you sure you want to delete QID: ${qid}?`);
    if (!confirm) return;

    try {
      await axios.delete(`http://localhost:5000/problem/${qid}`);
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
      case 'easy':
        return 'badge bg-success-subtle border border-success text-success px-3 py-2 rounded-pill';
      case 'medium':
        return 'badge bg-warning-subtle border border-warning text-warning px-3 py-2 rounded-pill';
      case 'hard':
        return 'badge bg-danger-subtle border border-danger text-danger px-3 py-2 rounded-pill';
      case 'basic':
        return 'badge bg-secondary-subtle border border-secondary text-secondary px-3 py-2 rounded-pill';
      default:
        return 'badge bg-light';
    }
  };

  const getTagBadge = (tag) => {
    return 'badge bg-warning text-dark px-2 py-1 rounded-pill';
  };

  if (!user) return <div className="alert alert-danger text-center mt-5">Unauthorized</div>;
  if (user.role !== 'admin') return ( <div className="container mt-5">
      <div className="alert alert-danger text-center">You are not logged in.</div>
    </div>);

  return (
    <><Navbar/>
    <div className="container my-5">
      <h3 className="mb-4 fw-bold"> Problems </h3>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Tag Filter */}
      <div className="mb-4">
        <input
          type="text"
          className="form-control"
          placeholder="Filter by Tags (e.g., array, dp, hash)"
          value={filterTag}
          onChange={handleFilterChange}
        />
      </div>

      {/* Filtered List */}
      <div className="list-group">
        {filtered.map((q, index) => (
          <div
            key={index}
            className="list-group-item list-group-item-action d-flex justify-content-between align-items-center border rounded mb-3"
          >
            <div className="d-flex flex-column">
              <strong className="text-secondary small">QID: {q.QID}</strong>
              <strong className="fs-5">{q.name}</strong>
              <span className="mt-1">{q.tag && <span className={getTagBadge(q.tag)}>{q.tag}</span>}</span>
            </div>

            <div className="d-flex align-items-center gap-2">
              <span className={getDifficultyBadge(q.difficulty)}>{q.difficulty?.toUpperCase()}</span>

              <button
                onClick={() => handleViewClick(q.QID)}
                className="btn btn-outline-primary btn-sm"
              >
                View Question
              </button>

              <button
                onClick={() => handleDelete(q.QID)}
                className="btn btn-outline-danger btn-sm"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  </>);
};

export default AProblems;
