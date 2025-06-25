import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from './navbar';

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return (
    <div className="container mt-5">
      <div className="alert alert-danger text-center">You are not logged in.</div>
    </div>
  );
     if (user.role === 'admin') return ( <div className="container mt-5">
      <div className="alert alert-danger text-center">You are not logged in.</div>
    </div>);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleProblems = () => {
    navigate('/problems');
  };

  return (
    <>
    <Navbar/>
    <div className="container mt-5 d-flex justify-content-center">
      <div className="card shadow-lg border-0" style={{ maxWidth: '450px', width: '100%' }}>
        <div className="card-body text-center">
          <h2 className="card-title mb-3">👋 Welcome Back!</h2>
          <h5 className="card-subtitle mb-2 text-primary">{user.firstname} {user.lastname}</h5>
          <p className="text-muted mb-4">📧 {user.email}</p>

          <div className="d-grid gap-2">
            <button className="btn btn-success" onClick={handleProblems}>
              <i className="bi bi-journal-code me-2"></i> Solve Problems
            </button>

            <button className="btn btn-outline-danger" onClick={handleLogout}>
              <i className="bi bi-box-arrow-right me-2"></i> Logout
            </button>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

export default Dashboard;
