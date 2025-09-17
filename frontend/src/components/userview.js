import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import Navbar from './navbar';
import ReactMarkdown from "react-markdown";

const Userview = () => {
  const API_URL = process.env.REACT_APP_SERVER_API;
  const { QID } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/problem/${QID}`);
        setProblem(res.data.problem);
        setError('');
      } catch (err) {
        setError('Failed to load problem. Please try again.');
        console.error('Error loading problem');
      } finally {
        setLoading(false);
      }
    };

    fetchProblem();
  }, [QID, API_URL]);

  const getDifficultyBadge = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return 'badge bg-success-subtle border border-success text-success px-4 py-2 rounded-pill fw-semibold fs-6';
      case 'medium':
        return 'badge bg-warning-subtle border border-warning text-warning px-4 py-2 rounded-pill fw-semibold fs-6';
      case 'hard':
        return 'badge bg-danger-subtle border border-danger text-danger px-4 py-2 rounded-pill fw-semibold fs-6';
      case 'basic':
        return 'badge bg-secondary-subtle border border-secondary text-secondary px-4 py-2 rounded-pill fw-semibold fs-6';
      default:
        return 'badge bg-light px-4 py-2 rounded-pill fw-semibold fs-6';
    }
  };

  const getTagBadge = (tag) => 'badge text-light px-3 py-2 rounded-pill fw-medium me-2 mb-2';

  const handleSolveClick = () => {
    navigate(`/problem/${QID}`);
  };

  const handleBackClick = () => {
    navigate('/problems');
  };

  if (!user) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100">
        <div className="alert alert-danger shadow-lg border-0 rounded-4 px-4 py-3">
          <h5 className="mb-0">⚠️ Unauthorized Access</h5>
        </div>
      </div>
    );
  }

  if (user.role === 'admin') {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger text-center shadow-lg border-0 rounded-4">
          <h5 className="mb-0">🔒 You are not logged in.</h5>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      
      {/* Custom Styles */}
      <style jsx>{`
        .hero-gradient {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          position: relative;
          overflow: hidden;
        }
        
        .hero-gradient::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.1);
        }
        
        .problem-card {
          border: none;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          border-radius: 20px;
          overflow: hidden;
          position: relative;
        }
        
        .problem-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 5px;
          background: linear-gradient(to right, #ff416c, #ff4b2b);
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
          box-shadow: 0 4px 15px rgba(255, 65, 108, 0.3);
        }
        
        .btn-gradient-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(255, 65, 108, 0.4);
          color: white;
        }
        
        .btn-gradient-secondary {
          background: linear-gradient(135deg, #11998e, #38ef7d);
          border: none;
          color: white;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(17, 153, 142, 0.3);
        }
        
        .btn-gradient-secondary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(17, 153, 142, 0.4);
          color: white;
        }
        
        .btn-outline-gradient {
          background: transparent;
          border: 2px solid transparent;
          background-image: linear-gradient(white, white), linear-gradient(135deg, #667eea, #764ba2);
          background-origin: border-box;
          background-clip: content-box, border-box;
          color: #667eea;
          transition: all 0.3s ease;
        }
        
        .btn-outline-gradient:hover {
          background-image: linear-gradient(135deg, #667eea, #764ba2), linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
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
        
        .markdown-content {
          line-height: 1.8;
        }
        
        .markdown-content h1,
        .markdown-content h2,
        .markdown-content h3,
        .markdown-content h4,
        .markdown-content h5,
        .markdown-content h6 {
          font-weight: 600;
          margin-top: 2rem;
          margin-bottom: 1rem;
        }
        
        .markdown-content p {
          margin-bottom: 1.5rem;
        }
        
        .markdown-content code {
          padding: 0.25rem 0.5rem;
          border-radius: 6px;
          font-size: 0.9em;
          color: #e53e3e;
        }
        
        .markdown-content pre {
          background: linear-gradient(135deg, #2d3748, #4a5568);
          color: #e2e8f0;
          padding: 1.5rem;
          border-radius: 12px;
          overflow-x: auto;
          margin: 1.5rem 0;
          border-left: 4px solid #ff416c;
        }
        
        .markdown-content pre code {
          background: transparent;
          color: inherit;
          border: none;
          padding: 0;
        }
        
        .markdown-content ul,
        .markdown-content ol {
          margin-bottom: 1.5rem;
          padding-left: 2rem;
        }
        
        .markdown-content li {
          margin-bottom: 0.5rem;
        }
        
        .markdown-content blockquote {
          border-left: 4px solid #11998e;
          padding: 1rem 1.5rem;
          margin: 1.5rem 0;
          border-radius: 8px;
        }
        
        /* Light theme styles */
        [data-bs-theme="light"] .markdown-content h1,
        [data-bs-theme="light"] .markdown-content h2,
        [data-bs-theme="light"] .markdown-content h3,
        [data-bs-theme="light"] .markdown-content h4,
        [data-bs-theme="light"] .markdown-content h5,
        [data-bs-theme="light"] .markdown-content h6 {
          color: #2d3748;
        }
        
        [data-bs-theme="light"] .markdown-content p,
        [data-bs-theme="light"] .markdown-content li {
          color: #4a5568;
        }
        
        [data-bs-theme="light"] .markdown-content code {
          background: linear-gradient(135deg, #f7fafc, #edf2f7);
          border: 1px solid #e2e8f0;
        }
        
        [data-bs-theme="light"] .markdown-content blockquote {
          background: linear-gradient(135deg, #f0fff4, #e6fffa);
          color: #2d3748;
        }
        
        [data-bs-theme="light"] .info-section {
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05));
          border: 1px solid rgba(102, 126, 234, 0.1);
        }
        
        /* Dark theme styles */
        [data-bs-theme="dark"] .markdown-content h1,
        [data-bs-theme="dark"] .markdown-content h2,
        [data-bs-theme="dark"] .markdown-content h3,
        [data-bs-theme="dark"] .markdown-content h4,
        [data-bs-theme="dark"] .markdown-content h5,
        [data-bs-theme="dark"] .markdown-content h6 {
          color: #e2e8f0;
        }
        
        [data-bs-theme="dark"] .markdown-content p,
        [data-bs-theme="dark"] .markdown-content li {
          color: #a0aec0;
        }
        
        [data-bs-theme="dark"] .markdown-content code {
          background: linear-gradient(135deg, #2d3748, #4a5568);
          border: 1px solid #4a5568;
          color: #fbb6ce;
        }
        
        [data-bs-theme="dark"] .markdown-content blockquote {
          background: linear-gradient(135deg, rgba(17, 153, 142, 0.1), rgba(56, 239, 125, 0.1));
          color: #e2e8f0;
        }
        
        [data-bs-theme="dark"] .info-section {
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
          border: 1px solid rgba(102, 126, 234, 0.2);
        }
        
        [data-bs-theme="dark"] .problem-card {
          background: #1a202c;
        }
        
        [data-bs-theme="dark"] .card-header,
        [data-bs-theme="dark"] .card-footer {
          background: #1a202c !important;
        }
        
        .info-section {
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05));
          border: 1px solid rgba(102, 126, 234, 0.1);
        }
      `}</style>



      <div className="container py-5">
        {/* Loading State */}
        {loading && (
          <div className="text-center py-5">
            <div className="loading-spinner rounded-circle mx-auto mb-3"></div>
            <p className="text-muted fs-5">Loading problem details...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="alert alert-danger border-0 rounded-4 shadow-sm mb-4">
            <div className="d-flex align-items-center">
              <span className="me-3 fs-4">⚠️</span>
              <div>
                <h6 className="mb-1">Error Loading Problem</h6>
                <small>{error}</small>
              </div>
            </div>
          </div>
        )}

        {/* Problem Content */}
        {!loading && !error && problem && (
          <div className="row justify-content-center">
            <div className="col-lg-10 col-xl-8">
              <div className="problem-card">
                {/* Problem Header */}
                <div className="card-header bg-white border-0 p-4 pb-0">
                  <div className="row align-items-start">
                    <div className="col-12">
                      <h1 className="gradient-text-secondary fw-bold mb-4 display-6">
                        {problem.name}
                      </h1>
                      
                      {/* Problem Meta Info */}
                      <div className="info-section rounded-3 p-4 mb-4">
                        <div className="row align-items-center">
                          <div className="col-md-6 mb-3 mb-md-0">
                            <div className="d-flex align-items-center">
                              <span className="text-muted fw-medium me-3">Difficulty:</span>
                              <span className={getDifficultyBadge(problem.difficulty)}>
                                {problem.difficulty?.toUpperCase() || 'UNKNOWN'}
                              </span>
                            </div>
                          </div>
                          <div className="col-md-6">
                            {problem.tag && (
                              <div className="d-flex align-items-center flex-wrap">
                                <span className="text-muted fw-medium me-3">Tags:</span>
                                <div className="d-flex flex-wrap">
                                  {problem.tag.split(',').map((tag, idx) => (
                                    <span key={idx} className={`${getTagBadge(tag.trim())} tag-badge`}>
                                      {tag.trim()}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Problem Description */}
                <div className="card-body p-4">
                  <div className="mb-4">
                    <h4 className="gradient-text-primary fw-bold mb-3">
                      📝 Problem Description
                    </h4>
                  </div>
                  
                  <div className="markdown-content">
                    <ReactMarkdown>
                      {problem.description}
                    </ReactMarkdown>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="card-footer bg-white border-0 p-4">
                  <div className="d-flex gap-3 justify-content-center">
                    <button 
                      onClick={handleBackClick}
                      className="btn btn-outline-gradient rounded-pill px-4 py-3"
                    >
                      Back to Problems
                    </button>
                    <button 
                      onClick={handleSolveClick}
                      className="btn btn-gradient-primary rounded-pill px-5 py-3 fw-semibold"
                    >
                      🚀 Start Solving
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Userview;