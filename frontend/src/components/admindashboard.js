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
         <h2
          className="mb-4 text-center fw-bold"
          style={{
            background: "linear-gradient(to right, #ff416c, #ff4b2b)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}
        >
         🛡️ Admin Info
        </h2>
       
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
         <h2
          className="mb-4 text-center fw-bold"
          style={{
            background: "linear-gradient(to right, #ff416c, #ff4b2b)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}
        >
          📊 Contribution Summary
        </h2>
      </div>
    
    ),

    // Page 2 - Actions
    (  
      <div className="book-page text-center">
         <h2
          className="mb-4 text-center fw-bold"
          style={{
            background: "linear-gradient(to right, #ff416c, #ff4b2b)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}
        >
          📂 Admin Actions
        </h2>
        
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
