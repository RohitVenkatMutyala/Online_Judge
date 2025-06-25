import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from './navbar';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

function ADashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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

  return (
    <>
      <Navbar />
      <div className="container mt-5 d-flex justify-content-center">
        <div
          className="p-5 rounded shadow text-center"
          style={{
            width: '100%',
            maxWidth: '450px',
            backgroundColor: '#2c2f36',
            color: '#f8f9fa',
          }}
        >
          <h2 className="mb-3 fw-bold">{user.firstname} {user.lastname}</h2>
          
          <p  style={{ color: 'yellow' }}>Email: {user.email}</p>

          <div className="d-grid gap-3 mt-4">
            <button
              className="btn btn-outline-warning fw-bold"
              onClick={handleContribute}
            >
              <i className="bi bi-plus-circle me-2"></i>
              Post Problem
            </button>

            <button
              className="btn btn-outline-info fw-bold text-white"
              onClick={handleViewProblems}
            >
              <i className="bi bi-list-check me-2"></i>
              Review Posted Problems
            </button>

            <button
              className="btn btn-outline-danger fw-bold"
              onClick={handleLogout}
            >
              <i className="bi bi-box-arrow-right me-2"></i>
              Logout
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default ADashboard;
