import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './sketchy.css'; // assuming it styles the book effect
import Navbar from './navbar';

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user || user.role === 'admin') {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger text-center">You are not logged in.</div>
      </div>
    );
  }

  const buttonStyle = {
    border: 'none',
    color: 'white',
    padding: '10px',
    borderRadius: '8px',
    fontWeight: '600',
    transition: 'all 0.3s ease-in-out',
    width: '100%',
  };

  return (
    <>
      <Navbar />
      <div className="container my-5 d-flex justify-content-center align-items-center">
        <div
          className="book shadow-lg p-4 rounded-4"
          style={{
            background: 'rgba(28,28,30,0.85)',
            backdropFilter: 'blur(10px)',
            maxWidth: '600px',
            width: '100%',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <div className="book-inner animate-page text-center">
            <h6>👤 User</h6>
            <h4>{user.firstname} {user.lastname}</h4>
            <p>{user.email}</p>

            <div className="mt-4">
              <button
                onClick={() => navigate('/problems')}
                style={{
                  ...buttonStyle,
                  background: 'linear-gradient(to right, #00c6ff, #0072ff)',
                }}
                onMouseEnter={e => e.target.style.background = 'linear-gradient(to right, #36d1dc, #5b86e5)'}
                onMouseLeave={e => e.target.style.background = 'linear-gradient(to right, #00c6ff, #0072ff)'}
              >
                🚀 Solve Problems
              </button>
              <button
                onClick={async () => { await logout(); navigate('/'); }}
                style={{
                  ...buttonStyle,
                  background: 'linear-gradient(to right, #f12711, #f5af19)',
                  marginTop: '10px',
                }}
                onMouseEnter={e => e.target.style.background = 'linear-gradient(to right, #ff416c, #ff4b2b)'}
                onMouseLeave={e => e.target.style.background = 'linear-gradient(to right, #f12711, #f5af19)'}
              >
                🚪 Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard;
