import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from './navbar';

const Problems = () => {
  const { user } = useAuth();
  const [problems, setProblems] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [filterTag, setFilterTag] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const fetchProblems = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/problems/user/${user._id}`);

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

  const handleSolveClick = (qid) => {
    navigate(`/problem/${qid}`);
  };

  const getDifficultyBadge = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return 'badge bg-success-subtle text-success border border-success rounded-pill px-3 py-1';
      case 'medium':
        return 'badge bg-warning-subtle text-warning border border-warning rounded-pill px-3 py-1';
      case 'hard':
        return 'badge bg-danger-subtle text-danger border border-danger rounded-pill px-3 py-1';
      case 'basic':
        return 'badge bg-secondary-subtle text-secondary border border-secondary rounded-pill px-3 py-1';
      default:
        return 'badge bg-light rounded-pill px-3 py-1';
    }
  };

  const getTagBadge = (tag) => {
    return 'badge bg-primary text-light rounded-pill me-2 mb-2 px-2 py-1';
  };

  if (!user) return <div className="alert alert-danger text-center mt-5">Unauthorized</div>;

  if (user.role === 'admin') return (
    <div className="container mt-5">
      <div className="alert alert-danger text-center">You are not logged in.</div>
    </div>
  );

  return (
    <>
      <Navbar />
      <div className="container my-5">
        <h3 className="mb-4 fw-bold">Start Shaping the Ideas</h3>

        {error && <div className="alert alert-danger">{error}</div>}

        {/* Filter input */}
        <div className="mb-4">
          <input
            type="text"
            className="form-control"
            placeholder="Filter by Tags (e.g., array, dp, hash)"
            value={filterTag}
            onChange={handleFilterChange}
          />
        </div>

        {/* Card layout for each problem */}
        <div className="row g-4">
          {filtered.map((q, index) => (
            <div key={index} className="col-md-6 col-lg-4">
              <div className="card shadow-sm position-relative h-100">
                {/* Top-right status badge */}
                <div
                  className={`position-absolute top-0 end-0 m-2 px-2 py-1 text-white rounded-pill small ${
                    q.status === 'Solved' ? 'bg-success' : 'bg-secondary'
                  }`}
                >
                  {q.status === 'Solved' ? 'Solved ✅' : 'Solved ❌'}
                </div>

                <div className="card-body d-flex flex-column justify-content-between">
                  <div>
                    <large className="text-muted">{`QID${q.QID}`}</large>
                    <h5 className="card-title mt-1">{q.name}</h5>

                    {/* Tags */}
                    {q.tag && (
                      <div className="d-flex flex-wrap mt-2">
                        {q.tag.split(',').map((tag, idx) => (
                          <span key={idx} className={getTagBadge(tag.trim())}>
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <span className={getDifficultyBadge(q.difficulty)}>
                      {q.difficulty?.toUpperCase()}
                    </span>
                    <button
                      onClick={() => handleSolveClick(q.QID)}
                      className="btn btn-outline-danger rounded-pill"
                    >
                      Solve &gt;
                    </button>
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

export default Problems;
