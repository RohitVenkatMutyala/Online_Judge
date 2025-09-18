import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from './navbar';

const Problems = () => {
  const API_URL = process.env.REACT_APP_SERVER_API;
  const { user } = useAuth();
  const [problems, setProblems] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [filterTag, setFilterTag] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const handleViewClick = (qid) => navigate(`/userproblem/${qid}`);

  useEffect(() => {
    if (!user) return;

    const fetchProblems = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/problems/user/${user._id}`, {
          withCredentials: true,
        });

        if (res.data.success) {
          setProblems(res.data.problems);
          setFiltered(res.data.problems);
        }
      } catch (err) {
        setError('Error loading problems');
      } finally {
        setLoading(false);
      }
    };

    fetchProblems();
  }, [user, API_URL]);

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
        return 'badge bg-success-subtle text-success border border-success rounded-pill px-3 py-2 fw-semibold';
      case 'medium':
        return 'badge bg-warning-subtle text-warning border border-warning rounded-pill px-3 py-2 fw-semibold';
      case 'hard':
        return 'badge bg-danger-subtle text-danger border border-danger rounded-pill px-3 py-2 fw-semibold';
      case 'basic':
        return 'badge bg-secondary-subtle text-secondary border border-secondary rounded-pill px-3 py-2 fw-semibold';
      default:
        return 'badge bg-light rounded-pill px-3 py-2 fw-semibold';
    }
  };

  const getTagBadge = (tag) => {
    return 'badge text-light rounded-pill me-2 mb-2 px-3 py-2 fw-medium';
  };

  const getStatusBadge = (status) => {
    return status === 'Solved' 
      ? 'position-absolute top-0 end-0 m-3 px-3 py-2 text-white rounded-pill fw-semibold bg-success shadow-sm'
      : 'position-absolute top-0 end-0 m-3 px-3 py-2 text-white rounded-pill fw-semibold shadow-sm';
  };

  const filteredProblems = filtered.filter(q => !q.tag?.toLowerCase().includes("pyq"));
  const solvedCount = filteredProblems.filter(q => q.status === 'Solved').length;
  const totalCount = filteredProblems.length;

  if (!user) return (
    <div className="d-flex align-items-center justify-content-center min-vh-100">
      <div className="alert alert-danger shadow-lg border-0 rounded-4 px-4 py-3">
        <h5 className="mb-0">⚠️ Unauthorized Access</h5>
      </div>
    </div>
  );

  if (user.role === 'admin') return (
    <div className="container mt-5">
      <div className="alert alert-danger text-center shadow-lg border-0 rounded-4">
        <h5 className="mb-0">🔒 You are not logged in.</h5>
      </div>
    </div>
  );

  return (
    <>
      <Navbar />
      
      {/* Custom Styles */}
      <style jsx>{`
        .hero-section {
          background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
          position: relative;
          overflow: hidden;
        }
        
        .hero-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.1);
        }
        
        .stats-card {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1));
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .stats-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }
        
        .problem-card {
          transition: all 0.3s ease;
          border: none;
          position: relative;
          overflow: hidden;
        }
        
        .problem-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 4px;
          background: linear-gradient(to right, #ff416c, #ff4b2b);
        }
        
        .problem-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
        }
        
        /* Light theme styles */
        [data-bs-theme="light"] .problem-card {
          background: #fff;
        }
        
        [data-bs-theme="light"] .problem-card:hover {
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
        }
        
        /* Dark theme styles */
        [data-bs-theme="dark"] .problem-card {
          background: #1a202c;
        }
        
        [data-bs-theme="dark"] .problem-card:hover {
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
        }
        
        .gradient-text-primary {
          background: linear-gradient(to right, #ff416c, #ff4b2b);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .gradient-text-secondary {
          background: linear-gradient(to right, #11998e, #38ef7d);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .tag-badge {
          background: linear-gradient(135deg, #667eea, #764ba2);
          transition: transform 0.2s ease;
        }
        
        .tag-badge:hover {
          transform: scale(1.05);
        }
        
        .btn-gradient-primary {
          background: linear-gradient(135deg, #ff416c, #ff4b2b);
          border: none;
          color: white;
          transition: all 0.3s ease;
        }
        
        .btn-gradient-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(255, 65, 108, 0.3);
          color: white;
        }
        
        .btn-gradient-secondary {
          background: linear-gradient(135deg, #11998e, #38ef7d);
          border: none;
          color: white;
          transition: all 0.3s ease;
        }
        
        .btn-gradient-secondary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(17, 153, 142, 0.3);
          color: white;
        }
        
        .search-input {
          border: 2px solid transparent;
          background: linear-gradient(white, white) padding-box,
                      linear-gradient(135deg, #667eea, #764ba2) border-box;
          transition: all 0.3s ease;
        }
        
        .search-input:focus {
          box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
          border-color: transparent;
        }
          .dark-theme .search-input::placeholder {
              color: #aaa !important;
              }
           .light-theme .search-input::placeholder {
            color: #555 !important;
              }
        
        .loading-spinner {
          width: 3rem;
          height: 3rem;
          border: 0.3em solid rgba(255, 65, 108, 0.2);
          border-top: 0.3em solid #ff416c;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .status-unsolved {
          background: linear-gradient(135deg, #ff6b6b, #ee5a52);
        }
      `}</style>

      {/* Hero Section */}
      <div className="hero-section py-5 text-white">
        <div className="container position-relative">
          <div className="row align-items-center">
            <div className="col-lg-8">
              <h1 className="display-4 fw-bold mb-3">
                🚀 Problem Dashboard
              </h1>
              <p className="lead mb-4 opacity-90">
                Track your coding journey and master algorithms step by step
              </p>
            </div>
            <div className="col-lg-4">
              <div className="stats-card rounded-4 p-4 text-center">
                <h3 className="fw-bold mb-2">{solvedCount}/{totalCount}</h3>
                <p className="mb-0 opacity-90">Problems Solved</p>
                <div className="progress mt-3" style={{height: '8px'}}>
                  <div 
                    className="progress-bar"
                    style={{
                      width: `${totalCount > 0 ? (solvedCount / totalCount) * 100 : 0}%`,
                      background: 'linear-gradient(to right, #f12711, #f5af19)'
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container my-5">
        {error && (
          <div className="alert alert-danger border-0 rounded-4 shadow-sm mb-4">
            <div className="d-flex align-items-center">
              <span className="me-2">⚠️</span>
              <strong>{error}</strong>
            </div>
          </div>
        )}

        {/* Enhanced Filter Section */}
    <div className="row mb-5">
  <div className="col-lg-8 mx-auto">
    <div className="card border-0 shadow-sm rounded-4 p-4 bg-body">
      <div className="row align-items-center">
        <div className="col-md-8">
          <label className="form-label fw-semibold text-body-secondary mb-2">
            🔍 Filter Problems by Tags
          </label>
          <input
            type="text"
            className="form-control form-control-lg search-input rounded-pill px-4 bg-body text-body"
            placeholder="Search tags: array, dp, hash, tree..."
            value={filterTag}
            onChange={handleFilterChange}
          />
        </div>
        <div className="col-md-4 text-md-end mt-3 mt-md-0">
          <div className="text-body-secondary">
            <small className="fw-medium">
              Showing {filteredProblems.length} problems
            </small>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-5">
            <div className="loading-spinner rounded-circle mx-auto mb-3"></div>
            <p className="text-muted">Loading your problems...</p>
          </div>
        )}

        {/* Problems Grid */}
        {!loading && (
          <div className="row g-4">
            {filteredProblems.map((q, index) => (
              <div key={index} className="col-lg-4 col-md-6">
                <div className="card problem-card shadow-sm rounded-4 h-100">
                  {/* Status Badge */}
                  <div className={getStatusBadge(q.status)}>
                    {q.status === 'Solved' ? '✅ Solved' : '⏳ Unsolved'}
                  </div>

                  <div className="card-body p-4 d-flex flex-column">
                    <div className="flex-grow-1">
                      {/* QID */}
                      <div className="mb-2">
                        <span className="gradient-text-primary fw-bold fs-5">
                          QID {q.QID}
                        </span>
                      </div>

                      {/* Problem Name */}
                      <h5 className="card-title gradient-text-secondary fw-bold mb-3 lh-base">
                        {q.name}
                      </h5>

                      {/* Tags */}
                      {q.tag && (
                        <div className="d-flex flex-wrap gap-2 mb-4">
                          {q.tag.split(',').map((tag, idx) => (
                            <span key={idx} className={`${getTagBadge(tag.trim())} tag-badge`}>
                              {tag.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Bottom Section */}
                    <div className="d-flex justify-content-between align-items-center">
                      <span className={getDifficultyBadge(q.difficulty)}>
                        {q.difficulty?.toUpperCase() || 'UNKNOWN'}
                      </span>
                      
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-gradient-secondary rounded-pill px-3 py-2"
                          onClick={() => handleViewClick(q.QID)}
                        >
                          <span className="fw-medium">View</span>
                        </button>
                        <button
                          onClick={() => handleSolveClick(q.QID)}
                          className="btn btn-gradient-primary rounded-pill px-3 py-2"
                        >
                          <span className="fw-medium">Solve</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredProblems.length === 0 && (
          <div className="text-center py-5">
            <div className="mb-4">
              <span style={{fontSize: '4rem'}}>📝</span>
            </div>
            <h4 className="gradient-text-primary fw-bold mb-3">No Problems Found</h4>
            <p className="text-muted">
              {filterTag ? 
                `No problems match your search for "${filterTag}"` : 
                'No problems available at the moment'
              }
            </p>
            {filterTag && (
              <button 
                className="btn btn-gradient-primary rounded-pill px-4 py-2 mt-3"
                onClick={() => {
                  setFilterTag('');
                  setFiltered(problems);
                }}
              >
                Clear Filter
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default Problems;