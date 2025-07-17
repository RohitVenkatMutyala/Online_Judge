import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './sketchy.css'; // contains book styles
import Navbar from './navbar';

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [pageIndex, setPageIndex] = useState(0);

  if (!user || user.role === 'admin') {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger text-center">You are not logged in.</div>
      </div>
    );
  }

  const pages = [
    // Page 1: User Info
    <div key="user" className="book-page text-center">
      <h6>👤 User</h6>
      <h4>{user.firstname} {user.lastname}</h4>
      <p>{user.email}</p>
    </div>,

    // Page 2: Auth
    <div key="auth" className="book-page text-center">
      <h6>🔐 Auth Service</h6>
      <p className="text-success fw-bold">Authenticated ✅</p>
    </div>,

    // Page 3: Navigation
    <div key="nav" className="book-page text-center">
      <h6>🧭 Navigation</h6>
      <button className="btn btn-outline-success w-100 mb-2" onClick={() => navigate('/problems')}>
        🚀 Solve Problems
      </button>
      <button className="btn btn-outline-danger w-100" onClick={async () => { await logout(); navigate('/'); }}>
        🚪 Logout
      </button>
    </div>,

    // Page 4: Stats
    <div key="stats" className="book-page text-start">
      <h6>📊 Problem Stats</h6>
      <ul className="list-unstyled mt-3">
        <li>✅ Solved: <strong>18</strong></li>
        <li>🕓 Pending: <strong>5</strong></li>
        <li>🔁 Retried: <strong>3</strong></li>
        <li>⚔️ Difficulty: <span className="badge bg-warning text-dark">Intermediate</span></li>
      </ul>
    </div>,

    // Page 5: Submissions
    <div key="submissions" className="book-page text-start">
      <h6>📦 Recent Submissions</h6>
      <ul className="mt-3">
        <li>✅ <strong>Reverse Linked List</strong> - Passed</li>
        <li>❌ <strong>Stock Span</strong> - Failed</li>
        <li>✅ <strong>Balanced Brackets</strong> - Passed</li>
        <li>🧪 <strong>Binary Search</strong> - Running...</li>
      </ul>
    </div>,

    // Page 6: Activity
    <div key="activity" className="book-page text-start">
      <h6>🧠 Activity</h6>
      <ul className="mt-3">
        <li>📅 Joined: <strong>Mar 2024</strong></li>
        <li>🏆 Rank: <span className="badge bg-info">#342</span></li>
        <li>⚡ Streak: <strong>5 days</strong></li>
        <li>💡 Level: <span className="badge bg-purple">Thinker</span></li>
      </ul>
    </div>
  ];

  return (
    <>
      <Navbar />
      <div className="container my-5 d-flex justify-content-center align-items-center">
        <div className="book shadow-lg">
          <div className="book-inner animate-page">
            {pages[pageIndex]}
          </div>
          <div className="book-controls mt-3 d-flex justify-content-between px-4">
            <button
              className="btn btn-outline-secondary"
              onClick={() => setPageIndex(prev => Math.max(0, prev - 1))}
              disabled={pageIndex === 0}
            >
              ◀️ Previous
            </button>
            <span className="text-muted align-self-center">Page {pageIndex + 1} of {pages.length}</span>
            <button
              className="btn btn-outline-primary"
              onClick={() => setPageIndex(prev => Math.min(pages.length - 1, prev + 1))}
              disabled={pageIndex === pages.length - 1}
            >
              Next ▶️
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard;
