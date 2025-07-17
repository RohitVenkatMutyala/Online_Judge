import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from './navbar';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './sketchy.css';

function ADashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [page, setPage] = useState(0);

  if (!user) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger text-center">You are not logged in.</div>
      </div>
    );
  }

  if (user.role !== 'admin') {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger text-center">You are not authorized to access this page.</div>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleContribute = () => {
    navigate('/postproblem');
  };

  const handleViewProblems = () => {
    navigate('/adminproblems');
  };

  const pages = [
    // Page 0 - Admin Info
    (
       <div className="book-inner">
      <div className="book-page text-center">
        <h3 className="fw-bold mb-2">🛡️ Admin Info</h3>
        <div className="sketch-box">
          <h5 className="fw-bold">{user.firstname} {user.lastname}</h5>
          <p className="text-warning">📧 {user.email}</p>
          <span className="badge bg-danger-subtle text-danger mt-2">Admin Privileges</span>
        </div>
      </div>
      </div>
    ),

    // Page 1 - Admin Stats
    (    
      <div className="book-page text-start">
        <h4 className="fw-bold mb-3">📊 Contribution Summary</h4>
        <ul className="list-unstyled sketch-box">
          <li>📝 Problems Posted: <strong>12</strong></li>
          <li>📈 Average Difficulty: <span className="badge bg-warning text-dark">Medium</span></li>
          <li>🧪 Test Cases Reviewed: <strong>36</strong></li>
          <li>⏱️ Last Activity: <strong>1 hour ago</strong></li>
        </ul>
      </div>
    
    ),

    // Page 2 - Actions
    (  
      <div className="book-page text-center">
        <h4 className="fw-bold mb-3">📂 Admin Actions</h4>
        <div className="d-grid gap-3 sketch-box">
          <button
            className="btn btn-outline-warning fw-bold sketchy-btn"
            onClick={handleContribute}
          >
            <i className="bi bi-plus-circle me-2"></i> Post Problem
          </button>

          <button
            className="btn btn-outline-info fw-bold text-white sketchy-btn"
            onClick={handleViewProblems}
          >
            <i className="bi bi-list-check me-2"></i> Review Posted Problems
          </button>

          <button
            className="btn btn-outline-danger fw-bold sketchy-btn"
            onClick={handleLogout}
          >
            <i className="bi bi-box-arrow-right me-2"></i> Logout
          </button>
        </div>
      </div>
      
    ),
  ];

  return (
    <>
      <Navbar />
      <div className="container mt-5 mb-5 d-flex justify-content-center">
        <div className="book">
          {pages[page]}

          <div className="d-flex justify-content-between mt-4">
            <button
              className="btn btn-outline-secondary sketchy-btn"
              disabled={page === 0}
              onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
            >
              ⬅️ Previous
            </button>
            <button
              className="btn btn-outline-secondary sketchy-btn"
              disabled={page === pages.length - 1}
              onClick={() => setPage((prev) => Math.min(prev + 1, pages.length - 1))}
            >
              Next ➡️
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default ADashboard;
